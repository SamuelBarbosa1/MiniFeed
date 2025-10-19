import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import Storage from '../utils/Storage';
import { getTheme } from '../utils/Theme';

const RegisterScreen = ({ navigation }) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const theme = getTheme(isDarkMode);

  useEffect(() => {
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

  const handleRegister = async () => {
    if (!username || !email || !password) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos.');
      return;
    }

    // Simple email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Erro', 'Por favor, insira um email válido.');
      return;
    }

    // Simple password validation (at least 6 characters)
    if (password.length < 6) {
      Alert.alert('Erro', 'A senha deve ter pelo menos 6 caracteres.');
      return;
    }

    try {
      // Check if user already exists
      const userExists = await Storage.checkUserExists(email);
      if (userExists) {
        Alert.alert('Erro', 'Este email já está cadastrado.');
        return;
      }

      // Clear all previous user data before creating new account
      await Storage.clearUser();
      
      // For a completely fresh start, we could clear all posts
      // But in a real social media app, we want to keep existing posts
      // So we'll just create the new user without clearing posts

      // Create new user object
      const newUser = {
        username,
        email,
        password, // In a real app, this should be hashed
        bio: ''
      };

      // Save user to storage
      await Storage.saveUser(newUser);

      Alert.alert(
        'Sucesso', 
        'Cadastro realizado com sucesso!', 
        [{ text: 'OK', onPress: () => navigation.navigate('Main') }]
      );
    } catch (error) {
      console.error('Error during registration:', error);
      Alert.alert('Erro', 'Ocorreu um erro durante o cadastro.');
    }
  };

  return (
    <KeyboardAvoidingView 
      style={[styles.container, { backgroundColor: theme.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.content}>
          <Text style={[styles.title, { color: theme.secondary }]}>Criar Conta</Text>
          
          <View style={[styles.form, { 
            backgroundColor: theme.cardBackground, 
            shadowColor: theme.secondary,
            borderColor: theme.border 
          }]}>
            <Text style={[styles.label, { color: theme.text }]}>Nome de Usuário</Text>
            <TextInput
              style={[styles.input, { 
                backgroundColor: theme.cardBackground, 
                borderColor: theme.border, 
                color: theme.text 
              }]}
              placeholder="Digite seu nome de usuário"
              placeholderTextColor={theme.placeholder}
              value={username}
              onChangeText={setUsername}
              autoCorrect={false}
            />

            <Text style={[styles.label, { color: theme.text }]}>Email</Text>
            <TextInput
              style={[styles.input, { 
                backgroundColor: theme.cardBackground, 
                borderColor: theme.border, 
                color: theme.text 
              }]}
              placeholder="Digite seu email"
              placeholderTextColor={theme.placeholder}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />

            <Text style={[styles.label, { color: theme.text }]}>Senha</Text>
            <TextInput
              style={[styles.input, { 
                backgroundColor: theme.cardBackground, 
                borderColor: theme.border, 
                color: theme.text 
              }]}
              placeholder="Digite sua senha"
              placeholderTextColor={theme.placeholder}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoCorrect={false}
            />

            <TouchableOpacity 
              style={[styles.button, { backgroundColor: theme.secondary }]} 
              onPress={handleRegister}
            >
              <Text style={[styles.buttonText, { color: theme.buttonText }]}>Cadastrar</Text>
            </TouchableOpacity>

            <View style={styles.footer}>
              <Text style={[styles.footerText, { color: theme.textSecondary }]}>Já tem uma conta? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                <Text style={[styles.link, { color: theme.secondary }]}>Entrar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  content: {
    alignItems: 'center',
  },
  title: {
    fontSize: 42,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 40,
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
  form: {
    padding: 30,
    borderRadius: 20,
    elevation: 5,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    width: '100%',
    maxWidth: 400,
    borderWidth: 1,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    fontWeight: '600',
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
    fontSize: 16,
  },
  button: {
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
    elevation: 3,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 30,
  },
  footerText: {
    fontSize: 16,
  },
  link: {
    fontWeight: 'bold',
    fontSize: 16,
    textDecorationLine: 'underline',
  },
});

export default RegisterScreen;