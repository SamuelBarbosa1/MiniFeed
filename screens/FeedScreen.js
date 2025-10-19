import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity } from 'react-native';
import Storage from '../utils/Storage';

const FeedScreen = () => {
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({
    followers: 0,
    following: 0,
    posts: 0
  });

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const userData = await Storage.getUser();
      if (userData) {
        setUser(userData);
        // In a real app, these stats would come from a database
        // For now, we'll use mock data
        setStats({
          followers: Math.floor(Math.random() * 1000) + 50,
          following: Math.floor(Math.random() * 500) + 20,
          posts: Math.floor(Math.random() * 100) + 5
        });
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const handleEditProfile = () => {
    // In a real app, this would navigate to an edit profile screen
    alert('Funcionalidade de edição de perfil em desenvolvimento!');
  };

  return (
    <ScrollView style={styles.container}>
      {/* User Profile Section */}
      <View style={styles.profileHeader}>
        <View style={styles.profileInfo}>
          <TouchableOpacity onPress={handleEditProfile} style={styles.avatarContainer}>
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarText}>
                {user ? user.username.charAt(0).toUpperCase() : 'U'}
              </Text>
            </View>
          </TouchableOpacity>
          
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{stats.posts}</Text>
              <Text style={styles.statLabel}>Publicações</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{stats.followers}</Text>
              <Text style={styles.statLabel}>Seguidores</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{stats.following}</Text>
              <Text style={styles.statLabel}>Seguindo</Text>
            </View>
          </View>
        </View>
        
        <View style={styles.userInfo}>
          <Text style={styles.username}>
            {user ? user.username : 'Usuário'}
          </Text>
          <Text style={styles.userEmail}>
            {user ? user.email : 'email@exemplo.com'}
          </Text>
          <Text style={styles.userBio}>
            Bem-vindo ao MiniFeed! Este é o seu espaço para compartilhar suas ideias e conectar-se com outros usuários.
          </Text>
        </View>
        
        <TouchableOpacity style={styles.editButton} onPress={handleEditProfile}>
          <Text style={styles.editButtonText}>Editar Perfil</Text>
        </TouchableOpacity>
      </View>
      
      {/* Feed Content */}
      <View style={styles.feedContent}>
        <Text style={styles.feedTitle}>Seu Feed</Text>
        <Text style={styles.feedDescription}>
          Aqui você verá suas postagens e atualizações.
        </Text>
        
        {/* Placeholder for future feed content */}
        <View style={styles.feedPlaceholder}>
          <Text style={styles.placeholderText}>Nenhuma publicação ainda</Text>
          <Text style={styles.placeholderSubtext}>Comece criando sua primeira postagem!</Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  profileHeader: {
    backgroundColor: 'white',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  profileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  avatarContainer: {
    marginRight: 20,
  },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#4285F4',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: 'white',
    fontSize: 32,
    fontWeight: 'bold',
  },
  statsContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  userInfo: {
    marginBottom: 20,
  },
  username: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  userEmail: {
    fontSize: 16,
    color: '#666',
    marginBottom: 10,
  },
  userBio: {
    fontSize: 16,
    color: '#555',
    lineHeight: 22,
  },
  editButton: {
    backgroundColor: '#f0f0f0',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  editButtonText: {
    color: '#333',
    fontSize: 16,
    fontWeight: '600',
  },
  feedContent: {
    padding: 20,
  },
  feedTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  feedDescription: {
    fontSize: 16,
    color: '#666',
    marginBottom: 30,
  },
  feedPlaceholder: {
    backgroundColor: 'white',
    padding: 30,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  placeholderText: {
    fontSize: 18,
    color: '#666',
    marginBottom: 10,
  },
  placeholderSubtext: {
    fontSize: 14,
    color: '#999',
  },
});

export default FeedScreen;