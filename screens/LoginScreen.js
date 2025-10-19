import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import Storage from '../utils/Storage';
import { getTheme } from '../utils/Theme';

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const theme = getTheme(isDarkMode);

  useEffect(() => {
    // Check for saved credentials on component mount
    checkSavedCredentials();
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

  const checkSavedCredentials = async () => {
    try {
      const savedCredentials = await Storage.getSavedCredentials();
      if (savedCredentials) {
        setEmail(savedCredentials.email);
        setPassword(savedCredentials.password);
        setRememberMe(true);
        // Auto-login if credentials are saved
        handleLogin(savedCredentials.email, savedCredentials.password);
      }
    } catch (error) {
      console.log('No saved credentials found');
    }
  };

  const handleLogin = async (savedEmail = null, savedPassword = null) => {
    const emailToUse = savedEmail || email;
    const passwordToUse = savedPassword || password;

    if (!emailToUse || !passwordToUse) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos.');
      return;
    }

    try {
      const user = await Storage.getUser();
      if (user && user.email === emailToUse && user.password === passwordToUse) {
        // Clear all previous user data before logging in
        await Storage.clearUser();
        
        // Save credentials if "Remember me" is checked
        if (rememberMe) {
          await Storage.saveCredentials({ email: emailToUse, password: passwordToUse });
        } else {
          await Storage.clearCredentials();
        }
        
        // Save the new user data
        await Storage.saveUser({
          username: user.username,
          email: user.email,
          password: user.password,
          bio: user.bio || ''
        });

        Alert.alert('Sucesso', 'Login realizado com sucesso!', [
          { text: 'OK', onPress: () => navigation.navigate('Main') }
        ]);
      } else {
        Alert.alert('Erro', 'Email ou senha incorretos.');
      }
    } catch (error) {
      console.error('Error during login:', error);
      Alert.alert('Erro', 'Ocorreu um erro durante o login.');
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
          <Text style={[styles.title, { color: theme.primary }]}>MiniFeed</Text>
          
          <View style={[styles.form, { 
            backgroundColor: theme.cardBackground, 
            shadowColor: theme.primary,
            borderColor: theme.border 
          }]}>
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

            <View style={styles.rememberMeContainer}>
              <TouchableOpacity 
                style={styles.checkboxContainer} 
                onPress={() => setRememberMe(!rememberMe)}
              >
                <View style={[styles.checkbox, rememberMe && styles.checkboxChecked, { 
                  borderColor: theme.primary, 
                  backgroundColor: rememberMe ? theme.primary : 'transparent' 
                }]}>
                  {rememberMe && <Text style={styles.checkmark}>✓</Text>}
                </View>
                <Text style={[styles.rememberMeText, { color: theme.text }]}>Lembrar-me</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity 
              style={[styles.button, { backgroundColor: theme.primary }]} 
              onPress={() => handleLogin()}
            >
              <Text style={[styles.buttonText, { color: theme.buttonText }]}>Entrar</Text>
            </TouchableOpacity>

            <View style={styles.footer}>
              <Text style={[styles.footerText, { color: theme.textSecondary }]}>Não tem uma conta? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                <Text style={[styles.link, { color: theme.primary }]}>Cadastre-se</Text>
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
    fontSize: 48,
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
  rememberMeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderRadius: 3,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  checkboxChecked: {
  },
  checkmark: {
    fontWeight: 'bold',
    fontSize: 12,
    color: 'white',
  },
  rememberMeText: {
    fontSize: 16,
  },
});

export default LoginScreen;