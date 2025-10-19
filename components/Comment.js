import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const Comment = ({ comment, theme }) => {
  // If no theme is provided, use default light theme
  const currentTheme = theme || {
    cardBackground: '#f8f9fa',
    primary: '#4285F4',
    text: '#333',
    textSecondary: '#666',
    border: '#e0e0e0',
  };

  return (
    <View style={[styles.container, { backgroundColor: currentTheme.cardBackground, borderColor: currentTheme.border }]}>
      <View style={styles.header}>
        <View style={[styles.avatarPlaceholder, { backgroundColor: currentTheme.primary }]}>
          <Text style={styles.avatarText}>{comment.username.charAt(0)}</Text>
        </View>
        <View style={styles.info}>
          <Text style={[styles.username, { color: currentTheme.text }]}>{comment.username}</Text>
          <Text style={[styles.timestamp, { color: currentTheme.textSecondary }]}>{comment.timestamp}</Text>
        </View>
      </View>
      <Text style={[styles.content, { color: currentTheme.text }]}>{comment.content}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 10,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  avatarPlaceholder: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  avatarText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  info: {
    flex: 1,
  },
  username: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  timestamp: {
    fontSize: 11,
  },
  content: {
    fontSize: 14,
    lineHeight: 18,
  },
});

export default Comment;