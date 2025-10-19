import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, FlatList, TouchableOpacity, Alert, ScrollView } from 'react-native';
import Storage from '../utils/Storage';
import { getTheme } from '../utils/Theme';

const SearchScreen = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [recentSearches, setRecentSearches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [popularSearches, setPopularSearches] = useState([]);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const theme = getTheme(isDarkMode);

  useEffect(() => {
    // Load recent searches from storage (in a real app)
    setRecentSearches(['João Silva', 'Maria Santos', 'Pedro Costa']);
    // Load popular searches
    setPopularSearches(['#tecnologia', '#viagem', '#comida', '#esportes', '#música']);
    // Load dark mode preference
    loadDarkModePreference();
  }, []);

  const loadDarkModePreference = async () => {
    try {
      const darkModePref = await Storage.getDarkModePreference();
      setIsDarkMode(darkModePref);
    } catch (error) {
      console.log('No dark mode preference found');
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    setLoading(true);
    
    try {
      // In a real app, this would search users/posts in a database
      // For now, we'll simulate search results
      const mockResults = [
        { id: '1', type: 'user', name: 'João Silva', username: '@joaosilva' },
        { id: '2', type: 'user', name: 'Maria Santos', username: '@mariasantos' },
        { id: '3', type: 'post', content: 'Ótimo dia para programar!', username: '@pedrocosta' },
        { id: '4', type: 'user', name: 'Ana Oliveira', username: '@anaoliveira' },
        { id: '5', type: 'post', content: 'Adorando essa nova música!', username: '@carloslima' },
        { id: '6', type: 'user', name: 'Fernanda Ribeiro', username: '@fernandaribeiro' },
      ].filter(item => 
        item.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.content?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      
      setSearchResults(mockResults);
    } catch (error) {
      console.error('Search error:', error);
      Alert.alert('Erro', 'Ocorreu um erro durante a busca.');
    } finally {
      setLoading(false);
    }
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
  };

  const handleRecentSearch = (query) => {
    setSearchQuery(query);
    // In a real app, you would trigger the search
    setTimeout(() => {
      handleSearch();
    }, 300);
  };

  const handlePopularSearch = (query) => {
    setSearchQuery(query);
    // In a real app, you would trigger the search
    setTimeout(() => {
      handleSearch();
    }, 300);
  };

  const renderSearchResult = ({ item }) => (
    <TouchableOpacity style={styles.resultItem}>
      {item.type === 'user' ? (
        <View style={styles.userResult}>
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.avatarText}>{item.name.charAt(0)}</Text>
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{item.name}</Text>
            <Text style={styles.userUsername}>{item.username}</Text>
          </View>
        </View>
      ) : (
        <View style={styles.postResult}>
          <Text style={styles.postContent} numberOfLines={2}>{item.content}</Text>
          <Text style={styles.postUsername}>{item.username}</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Search Header - Centered */}
      <View style={[styles.searchHeader, { backgroundColor: theme.cardBackground, borderBottomColor: theme.border }]}>
        <View style={[styles.searchContainer, { backgroundColor: theme.buttonSecondary }]}>
          <TextInput
            style={[styles.searchInput, { color: theme.text }]}
            placeholder="Pesquisar usuários ou publicações..."
            placeholderTextColor={theme.placeholder}
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearch}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={handleClearSearch} style={styles.clearButton}>
              <Text style={[styles.clearButtonText, { color: theme.textSecondary }]}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity 
          style={[styles.searchButton, { backgroundColor: theme.primary }]}
          onPress={handleSearch}
          disabled={loading}
        >
          <Text style={[styles.searchButtonText, { color: theme.buttonText }]}>Buscar</Text>
        </TouchableOpacity>
      </View>

      {/* Search Results or Recent Searches with Scroll */}
      <View style={styles.contentContainer}>
        {searchQuery.length > 0 ? (
          <FlatList
            data={searchResults}
            renderItem={renderSearchResult}
            keyExtractor={item => item.id}
            style={styles.resultsList}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={[styles.emptyText, { color: theme.text }]}>Nenhum resultado encontrado</Text>
                <Text style={[styles.emptySubtext, { color: theme.textSecondary }]}>Tente usar palavras-chave diferentes</Text>
              </View>
            }
          />
        ) : (
          <ScrollView style={styles.scrollContainer}>
            {/* Recent Searches */}
            <View style={[styles.sectionContainer, { backgroundColor: theme.cardBackground, borderBottomColor: theme.border }]}>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>Pesquisas Recentes</Text>
              {recentSearches.length > 0 ? (
                recentSearches.map((search, index) => (
                  <TouchableOpacity 
                    key={index} 
                    style={[styles.recentItem, { borderBottomColor: theme.border }]}
                    onPress={() => handleRecentSearch(search)}
                  >
                    <Text style={[styles.recentText, { color: theme.text }]}>🔍 {search}</Text>
                  </TouchableOpacity>
                ))
              ) : (
                <Text style={[styles.noDataText, { color: theme.textSecondary }]}>Nenhuma pesquisa recente</Text>
              )}
            </View>

            {/* Popular Searches */}
            <View style={[styles.sectionContainer, { backgroundColor: theme.cardBackground, borderBottomColor: theme.border }]}>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>Pesquisas Populares</Text>
              <View style={styles.tagsContainer}>
                {popularSearches.map((tag, index) => (
                  <TouchableOpacity 
                    key={index} 
                    style={[styles.tagItem, { backgroundColor: theme.buttonSecondary }]}
                    onPress={() => handlePopularSearch(tag)}
                  >
                    <Text style={[styles.tagText, { color: theme.text }]}>{tag}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Search Tips */}
            <View style={[styles.sectionContainer, { backgroundColor: theme.cardBackground, borderBottomColor: theme.border }]}>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>Dicas de Pesquisa</Text>
              <View style={styles.tipsContainer}>
                <Text style={[styles.tipText, { color: theme.textSecondary }]}>• Use # para pesquisar hashtags</Text>
                <Text style={[styles.tipText, { color: theme.textSecondary }]}>• Procure por nomes de usuários</Text>
                <Text style={[styles.tipText, { color: theme.textSecondary }]}>• Pesquise por conteúdo de publicações</Text>
                <Text style={[styles.tipText, { color: theme.textSecondary }]}>• Refine sua busca com mais palavras-chave</Text>
                <Text style={[styles.tipText, { color: theme.textSecondary }]}>• Use aspas para pesquisar frases exatas</Text>
              </View>
            </View>
          </ScrollView>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    flex: 1,
  },
  searchHeader: {
    flexDirection: 'row',
    padding: 15,
    borderBottomWidth: 1,
    alignItems: 'center',
    justifyContent: 'center', // Center the content
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    paddingHorizontal: 15,
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 10,
  },
  clearButton: {
    padding: 5,
  },
  clearButtonText: {
    fontSize: 18,
  },
  searchButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
    justifyContent: 'center',
  },
  searchButtonText: {
    fontWeight: '600',
  },
  scrollContainer: {
    flex: 1,
  },
  sectionContainer: {
    padding: 20,
    marginBottom: 10,
    borderBottomWidth: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  recentItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  recentText: {
    fontSize: 16,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tagItem: {
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
    marginRight: 10,
    marginBottom: 10,
  },
  tagText: {
    fontSize: 14,
  },
  tipsContainer: {
    padding: 10,
  },
  tipText: {
    fontSize: 14,
    marginBottom: 8,
  },
  noDataText: {
    fontSize: 14,
    fontStyle: 'italic',
  },
  resultsList: {
    flex: 1,
  },
  resultItem: {
    padding: 15,
    borderBottomWidth: 1,
    backgroundColor: '#ffffff',
    borderBottomColor: '#f0f0f0',
  },
  userResult: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#4285F4',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  avatarText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  userUsername: {
    fontSize: 14,
    color: '#666',
  },
  postResult: {
    flex: 1,
  },
  postContent: {
    fontSize: 16,
    color: '#333',
    marginBottom: 5,
  },
  postUsername: {
    fontSize: 14,
    color: '#4285F4',
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
  },
});

export default SearchScreen;