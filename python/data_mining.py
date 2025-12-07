import pandas as pd
import numpy as np
from sklearn.cluster import KMeans
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score
from datetime import datetime, timedelta
import json


def load_quest_logs(csv_path: str) -> pd.DataFrame:
    df = pd.read_csv(csv_path)
    df['started_at'] = pd.to_datetime(df['started_at'])
    df['completed_at'] = pd.to_datetime(df['completed_at'])
    df['created_at'] = pd.to_datetime(df['created_at'])
    return df


def clean_data(df: pd.DataFrame) -> pd.DataFrame:
    df = df.dropna(subset=['user_id', 'quest_id', 'status'])
    df['completion_time'] = (df['completed_at'] - df['started_at']).dt.total_seconds() / 3600
    df['completion_time'] = df['completion_time'].fillna(0)
    df['xp_awarded'] = df['xp_awarded'].fillna(0)
    df['gold_awarded'] = df['gold_awarded'].fillna(0)
    return df


def extract_user_features(df: pd.DataFrame) -> pd.DataFrame:
    user_features = df.groupby('user_id').agg({
        'quest_id': 'count',
        'status': lambda x: (x == 'completed').sum() / len(x) if len(x) > 0 else 0,
        'xp_awarded': 'sum',
        'gold_awarded': 'sum',
        'completion_time': 'mean',
        'college': 'first',
        'user_level': 'first',
    }).reset_index()

    user_features.columns = [
        'user_id',
        'total_quests',
        'completion_rate',
        'total_xp',
        'total_gold',
        'avg_completion_time',
        'college',
        'level',
    ]

    now = df['created_at'].max()
    last_activity = df.groupby('user_id')['created_at'].max().reset_index()
    last_activity.columns = ['user_id', 'last_activity']
    last_activity['days_inactive'] = (now - last_activity['last_activity']).dt.days

    user_features = user_features.merge(last_activity[['user_id', 'days_inactive']], on='user_id')

    weekly_activity = df.groupby(['user_id', pd.Grouper(key='created_at', freq='W')]).size()
    weekly_activity = weekly_activity.groupby('user_id').agg(['mean', 'std']).reset_index()
    weekly_activity.columns = ['user_id', 'avg_weekly_quests', 'std_weekly_quests']
    weekly_activity['std_weekly_quests'] = weekly_activity['std_weekly_quests'].fillna(0)

    user_features = user_features.merge(weekly_activity, on='user_id')

    return user_features


def cluster_students(user_features: pd.DataFrame, n_clusters: int = 5) -> pd.DataFrame:
    feature_cols = [
        'total_quests',
        'completion_rate',
        'total_xp',
        'avg_completion_time',
        'days_inactive',
        'avg_weekly_quests',
    ]

    X = user_features[feature_cols].values
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)

    kmeans = KMeans(n_clusters=n_clusters, random_state=42, n_init=10)
    user_features['cluster'] = kmeans.fit_predict(X_scaled)

    cluster_labels = {
        0: 'The Grinders',
        1: 'The Socializers',
        2: 'The Achievers',
        3: 'The Explorers',
        4: 'At-Risk',
    }

    cluster_centers = pd.DataFrame(
        scaler.inverse_transform(kmeans.cluster_centers_),
        columns=feature_cols
    )

    at_risk_cluster = cluster_centers['days_inactive'].idxmax()

    label_mapping = {}
    sorted_by_xp = cluster_centers['total_xp'].sort_values(ascending=False).index.tolist()

    for i, cluster_idx in enumerate(sorted_by_xp):
        if cluster_idx == at_risk_cluster:
            label_mapping[cluster_idx] = 'At-Risk'
        elif i == 0:
            label_mapping[cluster_idx] = 'The Achievers'
        elif i == 1:
            label_mapping[cluster_idx] = 'The Grinders'
        elif i == 2:
            label_mapping[cluster_idx] = 'The Socializers'
        else:
            label_mapping[cluster_idx] = 'The Explorers'

    user_features['cluster_label'] = user_features['cluster'].map(label_mapping)

    return user_features


def predict_attrition(user_features: pd.DataFrame) -> pd.DataFrame:
    user_features['is_at_risk'] = (
        (user_features['days_inactive'] > 14) |
        (user_features['completion_rate'] < 0.3) |
        (user_features['avg_weekly_quests'] < 0.5)
    ).astype(int)

    feature_cols = [
        'total_quests',
        'completion_rate',
        'total_xp',
        'avg_completion_time',
        'days_inactive',
        'avg_weekly_quests',
        'std_weekly_quests',
        'level',
    ]

    X = user_features[feature_cols].values
    y = user_features['is_at_risk'].values

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )

    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)

    rf_classifier = RandomForestClassifier(
        n_estimators=100,
        max_depth=10,
        random_state=42,
        class_weight='balanced',
    )
    rf_classifier.fit(X_train_scaled, y_train)

    y_pred = rf_classifier.predict(X_test_scaled)

    metrics = {
        'accuracy': accuracy_score(y_test, y_pred),
        'precision': precision_score(y_test, y_pred, zero_division=0),
        'recall': recall_score(y_test, y_pred, zero_division=0),
        'f1_score': f1_score(y_test, y_pred, zero_division=0),
    }

    print("Model Performance Metrics:")
    for metric, value in metrics.items():
        print(f"  {metric}: {value:.4f}")

    X_all_scaled = scaler.transform(user_features[feature_cols].values)
    user_features['attrition_risk'] = rf_classifier.predict_proba(X_all_scaled)[:, 1]

    feature_importance = pd.DataFrame({
        'feature': feature_cols,
        'importance': rf_classifier.feature_importances_,
    }).sort_values('importance', ascending=False)

    print("\nFeature Importance:")
    print(feature_importance.to_string(index=False))

    return user_features


def generate_insights(user_features: pd.DataFrame) -> dict:
    insights = {
        'total_students': len(user_features),
        'cluster_distribution': user_features['cluster_label'].value_counts().to_dict(),
        'at_risk_count': len(user_features[user_features['attrition_risk'] > 0.7]),
        'high_performers': len(user_features[user_features['cluster_label'] == 'The Achievers']),
        'avg_completion_rate': user_features['completion_rate'].mean(),
        'avg_weekly_activity': user_features['avg_weekly_quests'].mean(),
        'college_performance': user_features.groupby('college').agg({
            'total_xp': 'sum',
            'completion_rate': 'mean',
            'attrition_risk': 'mean',
        }).to_dict(),
    }

    return insights


def run_pipeline(csv_path: str) -> dict:
    print("Loading data...")
    df = load_quest_logs(csv_path)

    print("Cleaning data...")
    df = clean_data(df)

    print("Extracting user features...")
    user_features = extract_user_features(df)

    print("Clustering students...")
    user_features = cluster_students(user_features)

    print("Predicting attrition risk...")
    user_features = predict_attrition(user_features)

    print("Generating insights...")
    insights = generate_insights(user_features)

    output = {
        'insights': insights,
        'at_risk_students': user_features[user_features['attrition_risk'] > 0.7][
            ['user_id', 'college', 'attrition_risk', 'days_inactive', 'completion_rate']
        ].to_dict('records'),
        'cluster_summary': user_features.groupby('cluster_label').agg({
            'user_id': 'count',
            'total_xp': 'mean',
            'completion_rate': 'mean',
            'days_inactive': 'mean',
        }).to_dict(),
    }

    return output


if __name__ == '__main__':
    import sys

    if len(sys.argv) < 2:
        print("Usage: python data_mining.py <csv_path>")
        sys.exit(1)

    csv_path = sys.argv[1]
    results = run_pipeline(csv_path)

    print("\n" + "=" * 50)
    print("ANALYSIS RESULTS")
    print("=" * 50)
    print(json.dumps(results['insights'], indent=2))

    print("\n" + "=" * 50)
    print("AT-RISK STUDENTS (Top 10)")
    print("=" * 50)
    for student in results['at_risk_students'][:10]:
        print(f"  User: {student['user_id']}, College: {student['college']}, "
              f"Risk: {student['attrition_risk']:.2%}, "
              f"Inactive: {student['days_inactive']} days")




