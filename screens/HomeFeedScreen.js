import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, Alert, RefreshControl, Modal, Dimensions, Image } from 'react-native';
import * as Sharing from 'expo-sharing';
import * as Clipboard from 'expo-clipboard';
import Storage from '../utils/Storage';
import Comment from '../components/Comment';
import { getTheme } from '../utils/Theme';

const { width } = Dimensions.get('window');

const HomeFeedScreen = ({ navigation }) => {
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [newPostContent, setNewPostContent] = useState('');
  const [showPostInput, setShowPostInput] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [newComment, setNewComment] = useState('');
  const [editingPost, setEditingPost] = useState(null);
  const [editPostContent, setEditPostContent] = useState('');
  const [profileUpdateInterval, setProfileUpdateInterval] = useState(null);
  const [suggestedUsers, setSuggestedUsers] = useState([]);
  const [showUserSuggestions, setShowUserSuggestions] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const theme = getTheme(isDarkMode);

  useEffect(() => {
    loadUserData();
    loadPosts();
    loadDarkModePreference();
    
    // Set up interval to check for profile updates
    const interval = setInterval(checkForProfileUpdates, 5000); // Check every 5 seconds
    setProfileUpdateInterval(interval);
    
    // Clean up interval on unmount
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, []);

  const loadDarkModePreference = async () => {
    try {
      const darkModePref = await Storage.getDarkModePreference();
      setIsDarkMode(darkModePref);
    } catch (error) {
      console.log('No dark mode preference found');
    }
  };

  const loadUserData = async () => {
    try {
      const userData = await Storage.getUser();
      if (userData) {
        setUser(userData);
        // Load profile image if exists
        const savedProfileImage = await Storage.getProfileImage();
        if (savedProfileImage) {
          setProfileImage(savedProfileImage);
        } else {
          setProfileImage(null);
        }
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const loadPosts = async () => {
    try {
      // Get all posts for the feed
      const feedPosts = await Storage.getPosts();
      setPosts(feedPosts);
    } catch (error) {
      console.error('Error loading posts:', error);
      Alert.alert('Erro', 'Ocorreu um erro ao carregar as publicações.');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadPosts();
    setRefreshing(false);
  };

  const checkForProfileUpdates = async () => {
    try {
      const hasUpdate = await Storage.getProfileUpdateFlag();
      if (hasUpdate) {
        // Load updated user data
        await loadUserData();
        // Clear the update flag
        await Storage.clearProfileUpdateFlag();
      }
    } catch (error) {
      console.error('Error checking for profile updates:', error);
    }
  };

  const handleCreatePost = async () => {
    if (!newPostContent.trim()) {
      Alert.alert('Erro', 'Por favor, escreva algo antes de publicar.');
      return;
    }

    if (!user) {
      Alert.alert('Erro', 'Você precisa estar logado para publicar.');
      return;
    }

    // Create a new post object
    const newPost = {
      id: Date.now().toString(),
      userId: user.email,
      username: user.username,
      content: newPostContent,
      timestamp: new Date().toISOString(), // Store actual timestamp
      likes: 0,
      comments: [],
      commentsCount: 0,
      liked: false,
    };

    try {
      // Save the post to storage
      await Storage.savePost(newPost);
      
      // Add the new post to the beginning of the posts array
      setPosts(prevPosts => [newPost, ...prevPosts]);
      
      // Clear the input and hide the post input
      setNewPostContent('');
      setShowPostInput(false);
      setSuggestedUsers([]);
      setShowUserSuggestions(false);
      
      Alert.alert('Sucesso', 'Sua publicação foi criada com sucesso!');
    } catch (error) {
      console.error('Error creating post:', error);
      Alert.alert('Erro', 'Ocorreu um erro ao criar a publicação. Por favor, tente novamente.');
    }
  };

  const handleLike = async (postId) => {
    const updatedPosts = posts.map(post => {
      if (post.id === postId) {
        const wasLiked = post.liked;
        return {
          ...post,
          liked: !wasLiked,
          likes: wasLiked ? post.likes - 1 : post.likes + 1
        };
      }
      return post;
    });
    
    setPosts(updatedPosts);
    
    // Update in storage
    const post = posts.find(p => p.id === postId);
    if (post) {
      await Storage.updatePost(postId, {
        liked: !post.liked,
        likes: post.liked ? post.likes - 1 : post.likes + 1
      });
    }
  };

  const handleComment = (post) => {
    setSelectedPost(post);
    setShowComments(true);
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) {
      Alert.alert('Erro', 'Por favor, escreva algo antes de comentar.');
      return;
    }

    if (!user || !selectedPost) {
      Alert.alert('Erro', 'Ocorreu um erro. Por favor, tente novamente.');
      return;
    }

    const comment = {
      id: Date.now().toString(),
      userId: user.email,
      username: user.username,
      content: newComment,
      timestamp: new Date().toISOString()
    };

    try {
      await Storage.addComment(selectedPost.id, comment);
      
      // Update local state
      const updatedPosts = posts.map(post => {
        if (post.id === selectedPost.id) {
          return {
            ...post,
            comments: [...(post.comments || []), comment],
            commentsCount: (post.commentsCount || 0) + 1
          };
        }
        return post;
      });
      
      setPosts(updatedPosts);
      setNewComment('');
      
      // Update selected post
      setSelectedPost({
        ...selectedPost,
        comments: [...(selectedPost.comments || []), comment],
        commentsCount: (selectedPost.commentsCount || 0) + 1
      });
    } catch (error) {
      console.error('Error adding comment:', error);
      Alert.alert('Erro', 'Ocorreu um erro ao adicionar o comentário. Por favor, tente novamente.');
    }
  };

  const handleShare = async (postId) => {
    const post = posts.find(p => p.id === postId);
    if (post) {
      try {
        const message = `"${post.content}" - ${post.username}\n\nCompartilhado via MiniFeed`;
        
        // Check if sharing is available
        const isAvailable = await Sharing.isAvailableAsync();
        if (isAvailable) {
          await Sharing.shareAsync('', { message });
        } else {
          // Fallback: copy to clipboard
          await Clipboard.setStringAsync(message);
          Alert.alert(
            'Compartilhar',
            'Texto copiado para a área de transferência!\n\n' + message,
            [{ text: 'OK' }]
          );
        }
      } catch (error) {
        console.error('Error sharing post:', error);
        Alert.alert(
          'Erro',
          'Não foi possível compartilhar a publicação. O texto foi copiado para a área de transferência.',
          [{ text: 'OK' }]
        );
      }
    }
  };

  const formatPostContent = (content) => {
    // Simple formatting for demonstration
    return content.replace(/\n/g, '\n');
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

  const handleEditPost = (post) => {
    setEditingPost(post);
    setEditPostContent(post.content);
  };

  const saveEditPost = async () => {
    if (!editPostContent.trim()) {
      Alert.alert('Erro', 'Por favor, escreva algo antes de salvar.');
      return;
    }

    try {
      await Storage.editPost(editingPost.id, editPostContent);
      
      // Update local state
      const updatedPosts = posts.map(post => 
        post.id === editingPost.id ? { ...post, content: editPostContent } : post
      );
      
      setPosts(updatedPosts);
      setEditingPost(null);
      setEditPostContent('');
      
      Alert.alert('Sucesso', 'Publicação atualizada com sucesso!');
    } catch (error) {
      console.error('Error editing post:', error);
      Alert.alert('Erro', 'Ocorreu um erro ao atualizar a publicação. Por favor, tente novamente.');
    }
  };

  const handleDeletePost = (postId) => {
    Alert.alert(
      'Excluir Publicação',
      'Tem certeza que deseja excluir esta publicação?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Excluir', 
          style: 'destructive',
          onPress: async () => {
            try {
              await Storage.deletePost(postId);
              
              // Update local state
              const updatedPosts = posts.filter(post => post.id !== postId);
              setPosts(updatedPosts);
              
              Alert.alert('Sucesso', 'Publicação excluída com sucesso!');
            } catch (error) {
              console.error('Error deleting post:', error);
              Alert.alert('Erro', 'Ocorreu um erro ao excluir a publicação. Por favor, tente novamente.');
            }
          }
        }
      ]
    );
  };

  const handlePostContentChange = (text) => {
    setNewPostContent(text);
    
    // Check for @mentions
    const lastWord = text.split(' ').pop();
    if (lastWord && lastWord.startsWith('@') && lastWord.length > 1) {
      // In a real app, you would search for users matching the input
      // For now, we'll just show a mock list
      setSuggestedUsers(['@joaosilva', '@mariasantos', '@pedrocosta']);
      setShowUserSuggestions(true);
    } else {
      setShowUserSuggestions(false);
    }
  };

  const insertMention = (username) => {
    const words = newPostContent.split(' ');
    words[words.length - 1] = username;
    setNewPostContent(words.join(' ') + ' ');
    setShowUserSuggestions(false);
  };

  const renderPost = ({ item }) => (
    <View style={[styles.postContainer, { backgroundColor: theme.cardBackground, borderBottomColor: theme.border }]}>
      <View style={styles.postHeader}>
        <View style={[styles.avatarPlaceholder, { backgroundColor: theme.primary }]}>
          <Text style={styles.avatarText}>{item.username.charAt(0)}</Text>
        </View>
        <View style={styles.postUserInfo}>
          <Text style={[styles.postUsername, { color: theme.text }]}>{item.username}</Text>
          <Text style={[styles.postTimestamp, { color: theme.textSecondary }]}>{formatTimestamp(item.timestamp)}</Text>
        </View>
        {user && item.userId === user.email && (
          <TouchableOpacity 
            style={styles.postMenuButton}
            onPress={() => Alert.alert(
              'Opções da Publicação',
              'O que você gostaria de fazer?',
              [
                { text: 'Cancelar', style: 'cancel' },
                { text: 'Editar', onPress: () => handleEditPost(item) },
                { text: 'Excluir', onPress: () => handleDeletePost(item.id), style: 'destructive' }
              ]
            )}
          >
            <Text style={[styles.postMenuText, { color: theme.textSecondary }]}>⋯</Text>
          </TouchableOpacity>
        )}
      </View>
      
      <Text style={[styles.postContent, { color: theme.text }]}>{formatPostContent(item.content)}</Text>
      
      <View style={[styles.postActions, { borderTopColor: theme.border }]}>
        <TouchableOpacity 
          style={[styles.actionButton, item.liked && styles.likedButton]} 
          onPress={() => handleLike(item.id)}
        >
          <Text style={[styles.actionText, item.liked && styles.likedText, { color: item.liked ? theme.primary : theme.textSecondary }]}>
            ❤️ Curtir ({item.likes})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => handleComment(item)}
        >
          <Text style={[styles.actionText, { color: theme.textSecondary }]}>💬 Comentar ({item.commentsCount || 0})</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => handleShare(item.id)}
        >
          <Text style={[styles.actionText, { color: theme.textSecondary }]}>↪️ Compartilhar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderLoading = () => (
    <View style={[styles.loadingContainer, { backgroundColor: theme.background }]}>
      <Text style={[styles.loadingText, { color: theme.textSecondary }]}>Carregando feed...</Text>
    </View>
  );

  if (loading) {
    return renderLoading();
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <FlatList
        data={posts}
        renderItem={renderPost}
        keyExtractor={item => item.id}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[theme.primary]}
            tintColor={theme.primary}
          />
        }
        ListHeaderComponent={
          <View>
            {/* Post Creation Section */}
            <View style={[styles.createPostContainer, { backgroundColor: theme.cardBackground, borderBottomColor: theme.border }]}>
              <View style={styles.userInfo}>
                {profileImage ? (
                  <Image source={{ uri: profileImage }} style={styles.profileImage} />
                ) : (
                  <View style={[styles.avatarPlaceholder, { backgroundColor: theme.primary }]}> 
                    <Text style={styles.avatarText}>{user ? user.username.charAt(0) : 'U'}</Text>
                  </View>
                )}
                <TouchableOpacity 
                  style={[styles.createPostInput, { backgroundColor: theme.buttonSecondary }]}
                  onPress={() => setShowPostInput(true)}
                >
                  <Text style={[styles.createPostPlaceholder, { color: theme.placeholder }]}>
                    No que você está pensando?
                  </Text>
                </TouchableOpacity>
              </View>
              
              {showPostInput && (
                <View style={styles.postInputContainer}>
                  <TextInput
                    style={[styles.postInput, { 
                      backgroundColor: theme.cardBackground, 
                      borderColor: theme.border, 
                      color: theme.text 
                    }]}
                    placeholder="No que você está pensando?"
                    placeholderTextColor={theme.placeholder}
                    multiline
                    numberOfLines={4}
                    textAlignVertical="top"
                    value={newPostContent}
                    onChangeText={handlePostContentChange}
                  />
                  
                  {showUserSuggestions && (
                    <View style={[styles.suggestionsContainer, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
                      {suggestedUsers.map((username, index) => (
                        <TouchableOpacity
                          key={index}
                          style={[styles.suggestionItem, { borderBottomColor: theme.border }]}
                          onPress={() => insertMention(username)}
                        >
                          <Text style={[styles.suggestionText, { color: theme.primary }]}>{username}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                  
                  <View style={styles.postActionsContainer}>
                    <TouchableOpacity 
                      style={styles.cancelButton}
                      onPress={() => {
                        setNewPostContent('');
                        setShowPostInput(false);
                        setSuggestedUsers([]);
                        setShowUserSuggestions(false);
                      }}
                    >
                      <Text style={[styles.cancelButtonText, { color: theme.textSecondary }]}>Cancelar</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={[styles.postButton, !newPostContent.trim() && styles.postButtonDisabled, { 
                        backgroundColor: newPostContent.trim() ? theme.buttonPrimary : theme.buttonDisabled 
                      }]}
                      onPress={handleCreatePost}
                      disabled={!newPostContent.trim()}
                    >
                      <Text style={[styles.postButtonText, !newPostContent.trim() && styles.postButtonTextDisabled, { 
                        color: newPostContent.trim() ? theme.buttonText : theme.textSecondary 
                      }]}>
                        Publicar
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </View>
            
            {/* Divider */}
            <View style={[styles.divider, { backgroundColor: theme.border }]} />
          </View>
        }
        ListEmptyComponent={
          <View style={[styles.emptyContainer, { backgroundColor: theme.cardBackground }]}>
            <Text style={[styles.emptyText, { color: theme.text }]}>Nenhuma publicação encontrada</Text>
            <Text style={[styles.emptySubtext, { color: theme.textSecondary }]}>Seja o primeiro a publicar algo!</Text>
            <TouchableOpacity 
              style={[styles.createPostEmptyButton, { backgroundColor: theme.primary }]}
              onPress={() => setShowPostInput(true)}
            >
              <Text style={[styles.createPostEmptyText, { color: theme.buttonText }]}>Criar Publicação</Text>
            </TouchableOpacity>
          </View>
        }
      />
      
      {/* Comments Modal */}
      <Modal
        animationType="slide"
        transparent={false}
        visible={showComments}
        onRequestClose={() => setShowComments(false)}
      >
        <View style={[styles.modalContainer, { backgroundColor: theme.background }]}>
          <View style={[styles.modalHeader, { backgroundColor: theme.cardBackground, borderBottomColor: theme.border }]}>
            <TouchableOpacity onPress={() => setShowComments(false)}>
              <Text style={[styles.closeButton, { color: theme.text }]}>✕</Text>
            </TouchableOpacity>
            <Text style={[styles.modalTitle, { color: theme.text }]}>Comentários</Text>
            <View style={{ width: 20 }} /> {/* Spacer */}
          </View>
          
          {selectedPost && (
            <View style={[styles.selectedPostContainer, { backgroundColor: theme.cardBackground, borderBottomColor: theme.border }]}>
              <View style={styles.postHeader}>
                <View style={[styles.avatarPlaceholder, { backgroundColor: theme.primary }]}>
                  <Text style={styles.avatarText}>{selectedPost.username.charAt(0)}</Text>
                </View>
                <View style={styles.postUserInfo}>
                  <Text style={[styles.postUsername, { color: theme.text }]}>{selectedPost.username}</Text>
                  <Text style={[styles.postTimestamp, { color: theme.textSecondary }]}>{formatTimestamp(selectedPost.timestamp)}</Text>
                </View>
              </View>
              <Text style={[styles.postContent, { color: theme.text }]}>{selectedPost.content}</Text>
            </View>
          )}
          
          <FlatList
            data={selectedPost?.comments || []}
            renderItem={({ item }) => <Comment comment={item} theme={theme} />}
            keyExtractor={item => item.id}
            style={styles.commentsList}
            ListEmptyComponent={
              <View style={[styles.noCommentsContainer, { backgroundColor: theme.background }]}>
                <Text style={[styles.noCommentsText, { color: theme.text }]}>Nenhum comentário ainda</Text>
                <Text style={[styles.noCommentsSubtext, { color: theme.textSecondary }]}>Seja o primeiro a comentar!</Text>
              </View>
            }
          />
          
          <View style={[styles.commentInputContainer, { backgroundColor: theme.cardBackground, borderTopColor: theme.border }]}>
            <TextInput
              style={[styles.commentInput, { 
                backgroundColor: theme.buttonSecondary, 
                borderColor: theme.border,
                color: theme.text
              }]}
              placeholder="Escreva um comentário..."
              placeholderTextColor={theme.placeholder}
              value={newComment}
              onChangeText={setNewComment}
            />
            <TouchableOpacity 
              style={[styles.sendButton, !newComment.trim() && styles.sendButtonDisabled, { 
                backgroundColor: newComment.trim() ? theme.primary : theme.buttonDisabled 
              }]}
              onPress={handleAddComment}
              disabled={!newComment.trim()}
            >
              <Text style={[styles.sendButtonText, !newComment.trim() && styles.sendButtonTextDisabled, {
                color: newComment.trim() ? theme.buttonText : theme.textSecondary
              }]}>
                Enviar
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      
      {/* Edit Post Modal */}
      <Modal
        animationType="slide"
        transparent={false}
        visible={!!editingPost}
        onRequestClose={() => setEditingPost(null)}
      >
        <View style={[styles.modalContainer, { backgroundColor: theme.background }]}>
          <View style={[styles.modalHeader, { backgroundColor: theme.cardBackground, borderBottomColor: theme.border }]}>
            <TouchableOpacity onPress={() => setEditingPost(null)}>
              <Text style={[styles.closeButton, { color: theme.text }]}>✕</Text>
            </TouchableOpacity>
            <Text style={[styles.modalTitle, { color: theme.text }]}>Editar Publicação</Text>
            <TouchableOpacity onPress={saveEditPost}>
              <Text style={[styles.saveButton, { color: theme.primary }]}>Salvar</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.modalContent}>
            <TextInput
              style={[styles.editPostInput, { 
                backgroundColor: theme.cardBackground, 
                borderColor: theme.border,
                color: theme.text
              }]}
              value={editPostContent}
              onChangeText={setEditPostContent}
              placeholder="O que você está pensando?"
              placeholderTextColor={theme.placeholder}
              multiline
              numberOfLines={6}
              textAlignVertical="top"
            />
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
  },
  createPostContainer: {
    padding: 15,
    borderBottomWidth: 1,
    backgroundColor: '#fff',
    borderRadius: 10,
    margin: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  avatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  avatarText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  createPostInput: {
    flex: 1,
    borderRadius: 20,
    padding: 12,
    paddingHorizontal: 15,
    backgroundColor: '#f0f2f5',
  },
  createPostPlaceholder: {
    fontSize: 16,
    color: '#65676b',
  },
  postInputContainer: {
    marginTop: 10,
  },
  postInput: {
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    minHeight: 100,
    textAlignVertical: 'top',
    borderWidth: 1,
  },
  suggestionsContainer: {
    borderRadius: 8,
    borderWidth: 1,
    maxHeight: 150,
    marginTop: 5,
  },
  suggestionItem: {
    padding: 10,
    borderBottomWidth: 1,
  },
  suggestionText: {
    fontSize: 16,
  },
  postActionsContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 10,
  },
  cancelButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginRight: 10,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  postButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 6,
  },
  postButtonDisabled: {
  },
  postButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  postButtonTextDisabled: {
  },
  divider: {
    height: 10,
  },
  postContainer: {
    padding: 15,
    marginBottom: 10,
    backgroundColor: '#fff',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    marginHorizontal: 10,
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  postUserInfo: {
    flex: 1,
  },
  postUsername: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#050505',
  },
  postTimestamp: {
    fontSize: 12,
    color: '#65676b',
  },
  postMenuButton: {
    padding: 10,
  },
  postMenuText: {
    fontSize: 20,
  },
  postContent: {
    fontSize: 16,
    lineHeight: 22,
    marginBottom: 15,
  },
  postActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderTopColor: '#e4e6eb',
    paddingTop: 10,
    marginTop: 10,
  },
  actionButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    borderRadius: 6,
  },
  likedButton: {
    // No additional styling needed for the button itself
  },
  actionText: {
    fontSize: 14,
  },
  likedText: {
    fontWeight: 'bold',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  emptySubtext: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  createPostEmptyButton: {
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 8,
  },
  createPostEmptyText: {
    fontSize: 16,
    fontWeight: '600',
  },
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
  },
  closeButton: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  saveButton: {
    fontSize: 16,
    fontWeight: '600',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  selectedPostContainer: {
    padding: 15,
    borderBottomWidth: 1,
  },
  commentsList: {
    flex: 1,
    padding: 15,
  },
  noCommentsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  noCommentsText: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  noCommentsSubtext: {
    fontSize: 16,
    textAlign: 'center',
  },
  commentInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderTopWidth: 1,
  },
  commentInput: {
    flex: 1,
    borderRadius: 20,
    padding: 10,
    paddingHorizontal: 15,
    marginRight: 10,
    borderWidth: 1,
  },
  sendButton: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 20,
  },
  sendButtonDisabled: {
  },
  sendButtonText: {
    fontWeight: '600',
  },
  sendButtonTextDisabled: {
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  editPostInput: {
    flex: 1,
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    textAlignVertical: 'top',
    borderWidth: 1,
  },
});

export default HomeFeedScreen;
