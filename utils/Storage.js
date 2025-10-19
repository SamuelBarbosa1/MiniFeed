import AsyncStorage from '@react-native-async-storage/async-storage';

const Storage = {
  // User storage functions
  saveUser: async (user) => {
    try {
      await AsyncStorage.setItem('user', JSON.stringify(user));
      return { success: true };
    } catch (error) {
      console.error('Error saving user:', error);
      return { success: false, error };
    }
  },

  getUser: async () => {
    try {
      const user = await AsyncStorage.getItem('user');
      return user ? JSON.parse(user) : null;
    } catch (error) {
      console.error('Error getting user:', error);
      return null;
    }
  },

  clearUser: async () => {
    try {
      await AsyncStorage.removeItem('user');
      await AsyncStorage.removeItem('posts');
      await AsyncStorage.removeItem('savedCredentials');
      await AsyncStorage.removeItem('profileImage');
      await AsyncStorage.removeItem('profileUpdateFlag');
      await AsyncStorage.removeItem('darkMode');
      return { success: true };
    } catch (error) {
      console.error('Error clearing user:', error);
      return { success: false, error };
    }
  },

  // Credential storage functions for auto-login
  saveCredentials: async (credentials) => {
    try {
      await AsyncStorage.setItem('savedCredentials', JSON.stringify(credentials));
      return { success: true };
    } catch (error) {
      console.error('Error saving credentials:', error);
      return { success: false, error };
    }
  },

  getSavedCredentials: async () => {
    try {
      const credentials = await AsyncStorage.getItem('savedCredentials');
      return credentials ? JSON.parse(credentials) : null;
    } catch (error) {
      console.error('Error getting saved credentials:', error);
      return null;
    }
  },

  clearCredentials: async () => {
    try {
      await AsyncStorage.removeItem('savedCredentials');
      return { success: true };
    } catch (error) {
      console.error('Error clearing credentials:', error);
      return { success: false, error };
    }
  },

  // Check if user exists (for login validation)
  checkUserExists: async (email) => {
    try {
      const user = await Storage.getUser();
      return user && user.email === email;
    } catch (error) {
      console.error('Error checking user:', error);
      return false;
    }
  },

  // Post storage functions
  savePost: async (post) => {
    try {
      const posts = await Storage.getPosts();
      posts.unshift(post); // Add to beginning of array
      await AsyncStorage.setItem('posts', JSON.stringify(posts));
      return { success: true };
    } catch (error) {
      console.error('Error saving post:', error);
      return { success: false, error };
    }
  },

  getPosts: async () => {
    try {
      const posts = await AsyncStorage.getItem('posts');
      return posts ? JSON.parse(posts) : [];
    } catch (error) {
      console.error('Error getting posts:', error);
      return [];
    }
  },

  getUserPosts: async (userId) => {
    try {
      const posts = await Storage.getPosts();
      return posts.filter(post => post.userId === userId);
    } catch (error) {
      console.error('Error getting user posts:', error);
      return [];
    }
  },

  // Update post (for likes, comments, etc.)
  updatePost: async (postId, updates) => {
    try {
      const posts = await Storage.getPosts();
      const updatedPosts = posts.map(post => 
        post.id === postId ? { ...post, ...updates } : post
      );
      await AsyncStorage.setItem('posts', JSON.stringify(updatedPosts));
      return { success: true };
    } catch (error) {
      console.error('Error updating post:', error);
      return { success: false, error };
    }
  },

  // Profile image storage functions
  saveProfileImage: async (imageUri) => {
    try {
      await AsyncStorage.setItem('profileImage', imageUri);
      return { success: true };
    } catch (error) {
      console.error('Error saving profile image:', error);
      return { success: false, error };
    }
  },

  getProfileImage: async () => {
    try {
      const imageUri = await AsyncStorage.getItem('profileImage');
      return imageUri;
    } catch (error) {
      console.error('Error getting profile image:', error);
      return null;
    }
  },

  clearProfileImage: async () => {
    try {
      await AsyncStorage.removeItem('profileImage');
      return { success: true };
    } catch (error) {
      console.error('Error clearing profile image:', error);
      return { success: false, error };
    }
  },

  // Profile update notification functions
  saveProfileUpdateFlag: async (flag) => {
    try {
      await AsyncStorage.setItem('profileUpdateFlag', JSON.stringify(flag));
      return { success: true };
    } catch (error) {
      console.error('Error saving profile update flag:', error);
      return { success: false, error };
    }
  },

  getProfileUpdateFlag: async () => {
    try {
      const flag = await AsyncStorage.getItem('profileUpdateFlag');
      return flag ? JSON.parse(flag) : false;
    } catch (error) {
      console.error('Error getting profile update flag:', error);
      return false;
    }
  },

  clearProfileUpdateFlag: async () => {
    try {
      await AsyncStorage.removeItem('profileUpdateFlag');
      return { success: true };
    } catch (error) {
      console.error('Error clearing profile update flag:', error);
      return { success: false, error };
    }
  },

  // Dark mode preference functions
  saveDarkModePreference: async (isDarkMode) => {
    try {
      await AsyncStorage.setItem('darkMode', JSON.stringify(isDarkMode));
      return { success: true };
    } catch (error) {
      console.error('Error saving dark mode preference:', error);
      return { success: false, error };
    }
  },

  getDarkModePreference: async () => {
    try {
      const darkMode = await AsyncStorage.getItem('darkMode');
      return darkMode ? JSON.parse(darkMode) : false;
    } catch (error) {
      console.error('Error getting dark mode preference:', error);
      return false;
    }
  },

  // Delete post function
  deletePost: async (postId) => {
    try {
      const posts = await Storage.getPosts();
      const updatedPosts = posts.filter(post => post.id !== postId);
      await AsyncStorage.setItem('posts', JSON.stringify(updatedPosts));
      return { success: true };
    } catch (error) {
      console.error('Error deleting post:', error);
      return { success: false, error };
    }
  },

  // Edit post function
  editPost: async (postId, newContent) => {
    try {
      const posts = await Storage.getPosts();
      const updatedPosts = posts.map(post => 
        post.id === postId ? { ...post, content: newContent } : post
      );
      await AsyncStorage.setItem('posts', JSON.stringify(updatedPosts));
      return { success: true };
    } catch (error) {
      console.error('Error editing post:', error);
      return { success: false, error };
    }
  },

  // Comment storage functions
  addComment: async (postId, comment) => {
    try {
      const posts = await Storage.getPosts();
      const updatedPosts = posts.map(post => {
        if (post.id === postId) {
          const updatedComments = post.comments ? [...post.comments, comment] : [comment];
          return {
            ...post,
            comments: updatedComments,
            commentsCount: updatedComments.length
          };
        }
        return post;
      });
      await AsyncStorage.setItem('posts', JSON.stringify(updatedPosts));
      return { success: true };
    } catch (error) {
      console.error('Error adding comment:', error);
      return { success: false, error };
    }
  }
};

export default Storage;