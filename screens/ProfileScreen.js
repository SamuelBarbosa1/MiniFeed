import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, FlatList, RefreshControl, Image, TextInput } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import Storage from '../utils/Storage';

const ProfileScreen = ({ navigation }) => {
  const [user, setUser] = useState(null);
  const [userPosts, setUserPosts] = useState([]);
  const [likedPosts, setLikedPosts] = useState([]);
  const [mediaPosts, setMediaPosts] = useState([]);
  const [stats, setStats] = useState({
    posts: 0,
    followers: 0,
    following: 0
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('posts'); // posts, likes, media
  const [profileImage, setProfileImage] = useState(null);
  const [userBio, setUserBio] = useState('');
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [newBio, setNewBio] = useState('');

  useEffect(() => {
    loadUserData();
  }, []);

  useEffect(() => {
    if (user) {
      loadUserPosts();
    }
  }, [user, activeTab]);

  const loadUserData = async () => {
    try {
      const userData = await Storage.getUser();
      if (userData) {
        setUser(userData);
        setUserBio(userData.bio || 'Bem-vindo ao meu perfil no MiniFeed! Aqui você pode ver todas as minhas publicações.');
        // Load profile image if exists
        const savedProfileImage = await Storage.getProfileImage();
        if (savedProfileImage) {
          setProfileImage(savedProfileImage);
        }
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUserPosts = async () => {
    try {
      if (user) {
        const posts = await Storage.getUserPosts(user.email);
        setUserPosts(posts);
        
        // Filter liked posts (where user has liked)
        const liked = posts.filter(post => post.liked);
        setLikedPosts(liked);
        
        // Filter media posts (posts with media - for now we'll simulate this)
        const media = posts.filter(post => post.content.includes('#') || post.content.length > 50);
        setMediaPosts(media);
        
        // Update stats with actual post count
        setStats(prevStats => ({
          ...prevStats,
          posts: posts.length
        }));
      }
    } catch (error) {
      console.error('Error loading user posts:', error);
      Alert.alert('Erro', 'Ocorreu um erro ao carregar suas publicações.');
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadUserPosts();
    setRefreshing(false);
  };

  const handleChooseFromGallery = async () => {
    // Request permission to access media library
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permissão negada', 'Precisamos de permissão para acessar suas fotos.');
      return;
    }

    // Launch image picker
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      const selectedImage = result.assets[0].uri;
      setProfileImage(selectedImage);
      // Save profile image to storage
      await Storage.saveProfileImage(selectedImage);
    }
  };

  const handleTakePhoto = async () => {
    // Request permission to access camera
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permissão negada', 'Precisamos de permissão para acessar sua câmera.');
      return;
    }

    // Launch camera
    let result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      const selectedImage = result.assets[0].uri;
      setProfileImage(selectedImage);
      // Save profile image to storage
      await Storage.saveProfileImage(selectedImage);
    }
  };

  const showImagePickerOptions = () => {
    Alert.alert(
      'Adicionar Foto de Perfil',
      'Escolha uma opção:',
      [
        { text: 'Tirar Foto', onPress: handleTakePhoto },
        { text: 'Escolher da Galeria', onPress: handleChooseFromGallery },
        { text: 'Cancelar', style: 'cancel' }
      ]
    );
  };

  const handleAddProfilePhoto = () => {
    showImagePickerOptions();
  };

  const handleEditBio = () => {
    setIsEditingBio(true);
    setNewBio(userBio);
  };

  const saveBio = async () => {
    try {
      setUserBio(newBio);
      setIsEditingBio(false);
      
      // Update user data with new bio
      if (user) {
        const updatedUser = { ...user, bio: newBio };
        setUser(updatedUser);
        await Storage.saveUser(updatedUser);
      }
    } catch (error) {
      console.error('Error saving bio:', error);
      Alert.alert('Erro', 'Ocorreu um erro ao salvar sua bio.');
    }
  };

  const cancelEditBio = () => {
    setIsEditingBio(false);
    setNewBio(userBio);
  };

  const handleEditProfile = () => {
    Alert.alert(
      'Editar Perfil',
      'O que você gostaria de editar?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Foto de Perfil', onPress: showImagePickerOptions },
        { text: 'Bio', onPress: handleEditBio }
      ]
    );
  };

  const handleLogout = () => {
    Alert.alert(
      'Sair',
      'Tem certeza que deseja sair?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Sair', 
          style: 'destructive',
          onPress: async () => {
            try {
              await Storage.clearUser();
              navigation.navigate('Login');
            } catch (error) {
              console.error('Error during logout:', error);
              Alert.alert('Erro', 'Ocorreu um erro ao sair. Por favor, tente novamente.');
            }
          }
        }
      ]
    );
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return 'Agora mesmo';
    
    const postDate = new Date(timestamp);
    const now = new Date();
    const diffInSeconds = Math.floor((now - postDate) / 1000);
    
    if (diffInSeconds < 60) {
      return 'Agora mesmo';
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes} min${minutes > 1 ? 'utos' : 'uto'} atrás`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours} hora${hours > 1 ? 's' : ''} atrás`;
    } else if (diffInSeconds < 604800) {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days} dia${days > 1 ? 's' : ''} atrás`;
    } else {
      return postDate.toLocaleDateString('pt-BR');
    }
  };

  const renderPost = ({ item }) => (
    <TouchableOpacity style={styles.postItem} onPress={() => console.log('View post', item.id)}>
      {item.content.includes('#') || item.content.length > 50 ? (
        // If post has hashtags or is long, show as media post
        <View style={styles.mediaPost}>
          <Text style={styles.mediaPostText} numberOfLines={3}>{item.content}</Text>
          <View style={styles.postStats}>
            <Text style={styles.statText}>❤️ {item.likes}</Text>
            <Text style={styles.statText}>💬 {item.commentsCount || 0}</Text>
          </View>
          <Text style={styles.postTimestampSmall}>{formatTimestamp(item.timestamp)}</Text>
        </View>
      ) : (
        // Regular post
        <View style={styles.regularPost}>
          <Text style={styles.postText} numberOfLines={3}>{item.content}</Text>
          <View style={styles.postStats}>
            <Text style={styles.statText}>❤️ {item.likes}</Text>
            <Text style={styles.statText}>💬 {item.commentsCount || 0}</Text>
          </View>
          <Text style={styles.postTimestampSmall}>{formatTimestamp(item.timestamp)}</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  const renderLoading = () => (
    <View style={styles.loadingContainer}>
      <Text style={styles.loadingText}>Carregando perfil...</Text>
    </View>
  );

  if (loading) {
    return renderLoading();
  }

  if (!user) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Erro ao carregar dados do usuário</Text>
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={['#4285F4']}
          tintColor="#4285F4"
        />
      }
    >
      {/* Profile Header */}
      <View style={styles.profileHeader}>
        <View style={styles.profileInfo}>
          <TouchableOpacity onPress={handleAddProfilePhoto} style={styles.avatarContainer}>
            {profileImage ? (
              <Image source={{ uri: profileImage }} style={styles.profileImage} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarText}>{user.username.charAt(0).toUpperCase()}</Text>
              </View>
            )}
            <View style={styles.cameraIcon}>
              <Text style={styles.cameraIconText}>📷</Text>
            </View>
            <Text style={styles.changePhotoText}>Alterar Foto</Text>
          </TouchableOpacity>
          
          <View style={styles.statsContainer}>
            <TouchableOpacity style={styles.statItem} onPress={() => setActiveTab('posts')}>
              <Text style={styles.statNumber}>{stats.posts}</Text>
              <Text style={styles.statLabel}>Publicações</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.statItem} onPress={() => console.log('View followers')}>
              <Text style={styles.statNumber}>{stats.followers}</Text>
              <Text style={styles.statLabel}>Seguidores</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.statItem} onPress={() => console.log('View following')}>
              <Text style={styles.statNumber}>{stats.following}</Text>
              <Text style={styles.statLabel}>Seguindo</Text>
            </TouchableOpacity>
          </View>
        </View>
        
        <View style={styles.userInfo}>
          <Text style={styles.username}>{user.username}</Text>
          <Text style={styles.userEmail}>{user.email}</Text>
          {isEditingBio ? (
            <View style={styles.bioEditContainer}>
              <TextInput
                style={styles.bioInput}
                value={newBio}
                onChangeText={setNewBio}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
              <View style={styles.bioActions}>
                <TouchableOpacity style={styles.cancelBioButton} onPress={cancelEditBio}>
                  <Text style={styles.cancelBioText}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.saveBioButton} onPress={saveBio}>
                  <Text style={styles.saveBioText}>Salvar</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View style={styles.bioContainer}>
              <Text style={styles.userBio}>{userBio}</Text>
              <TouchableOpacity style={styles.editBioButton} onPress={handleEditBio}>
                <Text style={styles.editBioText}>Editar Bio</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
        
        <TouchableOpacity style={styles.editButton} onPress={handleEditProfile}>
          <Text style={styles.editButtonText}>Editar Perfil</Text>
        </TouchableOpacity>
      </View>
      
      {/* Profile Tabs */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'posts' && styles.activeTab]}
          onPress={() => setActiveTab('posts')}
        >
          <Text style={[styles.tabText, activeTab === 'posts' && styles.activeTabText]}>Publicações</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'likes' && styles.activeTab]}
          onPress={() => setActiveTab('likes')}
        >
          <Text style={[styles.tabText, activeTab === 'likes' && styles.activeTabText]}>Curtidas</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'media' && styles.activeTab]}
          onPress={() => setActiveTab('media')}
        >
          <Text style={[styles.tabText, activeTab === 'media' && styles.activeTabText]}>Mídia</Text>
        </TouchableOpacity>
      </View>
      
      {/* Content based on active tab */}
      <View style={styles.contentContainer}>
        {activeTab === 'posts' && (
          <>
            <Text style={styles.sectionTitle}>Minhas Publicações</Text>
            {userPosts.length > 0 ? (
              <FlatList
                data={userPosts}
                renderItem={renderPost}
                keyExtractor={item => item.id}
                numColumns={3}
                scrollEnabled={false}
                contentContainerStyle={styles.postsGrid}
              />
            ) : (
              <View style={styles.emptyPostsContainer}>
                <Text style={styles.emptyPostsText}>Você ainda não fez nenhuma publicação</Text>
                <Text style={styles.emptyPostsSubtext}>Toque no botão "+" no feed para criar sua primeira publicação</Text>
              </View>
            )}
          </>
        )}
        
        {activeTab === 'likes' && (
          <>
            <Text style={styles.sectionTitle}>Publicações Curtidas</Text>
            {likedPosts.length > 0 ? (
              <FlatList
                data={likedPosts}
                renderItem={renderPost}
                keyExtractor={item => item.id}
                numColumns={3}
                scrollEnabled={false}
                contentContainerStyle={styles.postsGrid}
              />
            ) : (
              <View style={styles.emptyPostsContainer}>
                <Text style={styles.emptyPostsText}>Você ainda não curtiu nenhuma publicação</Text>
                <Text style={styles.emptyPostsSubtext}>Toque no coração nas publicações para curtir</Text>
              </View>
            )}
          </>
        )}
        
        {activeTab === 'media' && (
          <>
            <Text style={styles.sectionTitle}>Mídia</Text>
            {mediaPosts.length > 0 ? (
              <FlatList
                data={mediaPosts}
                renderItem={renderPost}
                keyExtractor={item => item.id}
                numColumns={3}
                scrollEnabled={false}
                contentContainerStyle={styles.postsGrid}
              />
            ) : (
              <View style={styles.emptyPostsContainer}>
                <Text style={styles.emptyPostsText}>Nenhuma mídia encontrada</Text>
                <Text style={styles.emptyPostsSubtext}>Publicações com fotos ou vídeos aparecerão aqui</Text>
              </View>
            )}
          </>
        )}
      </View>
      

    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  errorText: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
    marginTop: 50,
  },
  profileHeader: {
    backgroundColor: 'white',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  profileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  avatarContainer: {
    marginRight: 20,
    position: 'relative',
  },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#4285F4',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  avatarText: {
    color: 'white',
    fontSize: 32,
    fontWeight: 'bold',
  },
  cameraIcon: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#f0f0f0',
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'white',
  },
  cameraIconText: {
    fontSize: 16,
  },
  changePhotoText: {
    fontSize: 12,
    color: '#4285F4',
    marginTop: 5,
    textAlign: 'center',
    fontWeight: '600',
  },
  statsContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
    padding: 5,
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
  bioContainer: {
    marginBottom: 15,
  },
  userBio: {
    fontSize: 16,
    color: '#555',
    lineHeight: 22,
    marginBottom: 10,
  },
  editBioButton: {
    alignSelf: 'flex-start',
  },
  editBioText: {
    color: '#4285F4',
    fontSize: 14,
    fontWeight: '600',
  },
  bioEditContainer: {
    marginBottom: 15,
  },
  bioInput: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
    marginBottom: 10,
    minHeight: 60,
  },
  bioActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  cancelBioButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    marginRight: 10,
  },
  cancelBioText: {
    color: '#666',
    fontSize: 14,
    fontWeight: '600',
  },
  saveBioButton: {
    backgroundColor: '#4285F4',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 6,
  },
  saveBioText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
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
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  tab: {
    flex: 1,
    paddingVertical: 15,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#4285F4',
  },
  tabText: {
    fontSize: 16,
    color: '#666',
  },
  activeTabText: {
    color: '#4285F4',
    fontWeight: '600',
  },
  contentContainer: {
    padding: 20,
    backgroundColor: 'white',
    marginBottom: 10,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    marginHorizontal: 10,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  postsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  postItem: {
    width: '31%',
    aspectRatio: 1,
    marginBottom: 15,
    borderRadius: 8,
    overflow: 'hidden',
  },
  regularPost: {
    flex: 1,
    backgroundColor: '#f0f2f5',
    borderRadius: 8,
    padding: 10,
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 1,
  },
  mediaPost: {
    flex: 1,
    backgroundColor: '#4285F4',
    borderRadius: 8,
    padding: 10,
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 1,
  },
  postText: {
    fontSize: 12,
    color: '#333',
    flex: 1,
  },
  mediaPostText: {
    fontSize: 12,
    color: 'white',
    flex: 1,
  },
  postStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 5,
  },
  statText: {
    fontSize: 10,
    color: '#666',
  },
  postTimestampSmall: {
    fontSize: 10,
    color: '#999',
    marginTop: 5,
    textAlign: 'right',
  },
  emptyPostsContainer: {
    alignItems: 'center',
    padding: 30,
  },
  emptyPostsText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 5,
    textAlign: 'center',
  },
  emptyPostsSubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },

});

export default ProfileScreen;