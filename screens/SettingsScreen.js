import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Alert, TextInput, Modal } from 'react-native';
import Storage from '../utils/Storage';

const SettingsScreen = ({ navigation }) => {
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [location, setLocation] = useState(false);
  const [loading, setLoading] = useState(false);
  const [biometricAuth, setBiometricAuth] = useState(false);
  const [user, setUser] = useState(null);
  
  // Profile editing states
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newBio, setNewBio] = useState('');
  
  // Password change states
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  useEffect(() => {
    loadUserData();
    // Load dark mode preference
    loadDarkModePreference();
  }, []);

  const loadDarkModePreference = async () => {
    try {
      const darkModePref = await Storage.getDarkModePreference();
      setDarkMode(darkModePref);
    } catch (error) {
      console.log('No dark mode preference found');
    }
  };

  const loadUserData = async () => {
    try {
      const userData = await Storage.getUser();
      if (userData) {
        setUser(userData);
        setNewUsername(userData.username || '');
        setNewEmail(userData.email || '');
        setNewBio(userData.bio || '');
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const handleEditProfile = () => {
    setShowEditProfile(true);
  };

  const saveProfileChanges = async () => {
    if (!newUsername.trim() || !newEmail.trim()) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    // Simple email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newEmail)) {
      Alert.alert('Erro', 'Por favor, insira um email válido.');
      return;
    }

    try {
      const updatedUser = {
        ...user,
        username: newUsername,
        email: newEmail,
        bio: newBio
      };

      await Storage.saveUser(updatedUser);
      setUser(updatedUser);
      setShowEditProfile(false);
      
      // Notify other screens about the profile update
      // We'll use a simple event system by storing a flag in AsyncStorage
      await Storage.saveProfileUpdateFlag(true);
      
      Alert.alert('Sucesso', 'Perfil atualizado com sucesso!');
    } catch (error) {
      console.error('Error saving profile:', error);
      Alert.alert('Erro', 'Ocorreu um erro ao atualizar o perfil.');
    }
  };

  const handleChangePassword = () => {
    setShowChangePassword(true);
  };

  const savePasswordChange = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos.');
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert('Erro', 'A nova senha deve ter pelo menos 6 caracteres.');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Erro', 'As senhas não coincidem.');
      return;
    }

    // Verify current password
    if (currentPassword !== user.password) {
      Alert.alert('Erro', 'A senha atual está incorreta.');
      return;
    }

    try {
      const updatedUser = {
        ...user,
        password: newPassword
      };

      await Storage.saveUser(updatedUser);
      setUser(updatedUser);
      setShowChangePassword(false);
      
      // Clear password fields
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      
      Alert.alert('Sucesso', 'Senha alterada com sucesso!');
    } catch (error) {
      console.error('Error changing password:', error);
      Alert.alert('Erro', 'Ocorreu um erro ao alterar a senha.');
    }
  };

  const handlePrivacySettings = () => {
    Alert.alert(
      'Configurações de Privacidade',
      'Controle quem pode ver seu conteúdo e entrar em contato com você.',
      [{ text: 'OK' }]
    );
  };

  const handleNotificationSettings = () => {
    Alert.alert(
      'Configurações de Notificação',
      'Personalize quais notificações você deseja receber.',
      [{ text: 'OK' }]
    );
  };

  const toggleDarkMode = async (value) => {
    setDarkMode(value);
    try {
      await Storage.saveDarkModePreference(value);
      // In a real app, you would dispatch an event to update the theme
      Alert.alert('Sucesso', `Modo ${value ? 'escuro' : 'claro'} ativado!`);
    } catch (error) {
      console.error('Error saving dark mode preference:', error);
    }
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
              setLoading(true);
              await Storage.clearUser();
              navigation.navigate('Login');
            } catch (error) {
              console.error('Error during logout:', error);
              Alert.alert('Erro', 'Ocorreu um erro ao sair. Por favor, tente novamente.');
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Excluir Conta',
      'Tem certeza que deseja excluir permanentemente sua conta? Esta ação não pode ser desfeita.',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Excluir', 
          style: 'destructive',
          onPress: async () => {
            try {
              // Clear all user data when deleting account
              await Storage.clearUser();
              Alert.alert(
                'Conta Excluída',
                'Sua conta foi excluída com sucesso.',
                [{ text: 'OK', onPress: () => navigation.navigate('Login') }]
              );
            } catch (error) {
              console.error('Error deleting account:', error);
              Alert.alert('Erro', 'Ocorreu um erro ao excluir a conta. Por favor, tente novamente.');
            }
          }
        }
      ]
    );
  };

  const handleTerms = () => {
    Alert.alert(
      'Termos de Uso',
      'Termos de uso do MiniFeed:\n\n1. Respeite os outros usuários\n2. Não compartilhe conteúdo ofensivo\n3. Mantenha suas informações atualizadas\n4. Use o aplicativo de forma responsável',
      [{ text: 'OK' }]
    );
  };

  const handlePrivacy = () => {
    Alert.alert(
      'Política de Privacidade',
      'Política de privacidade do MiniFeed:\n\n1. Seus dados são protegidos\n2. Não compartilhamos informações com terceiros\n3. Você controla suas configurações de privacidade\n4. Seus posts são visíveis apenas para seguidores',
      [{ text: 'OK' }]
    );
  };

  const handleHelp = () => {
    Alert.alert(
      'Ajuda e Suporte',
      'Precisa de ajuda? Entre em contato conosco:\n\nEmail: suporte@minifeed.com\nTelefone: (11) 99999-9999',
      [{ text: 'OK' }]
    );
  };

  const handleRateApp = () => {
    Alert.alert(
      'Avaliar o App',
      'Obrigado por usar o MiniFeed! Que tal nos avaliar na loja?',
      [
        { text: 'Avaliar Agora', onPress: () => console.log('Rate app') },
        { text: 'Mais Tarde', style: 'cancel' }
      ]
    );
  };

  const handleContact = () => {
    Alert.alert(
      'Fale Conosco',
      'Entre em contato conosco:\n\nEmail: contato@minifeed.com\nTelefone: (11) 99999-9999',
      [{ text: 'OK' }]
    );
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Configurações</Text>
      
      {/* Account Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Conta</Text>
        <TouchableOpacity style={styles.settingItem} onPress={handleEditProfile}>
          <Text style={styles.settingText}>Editar Perfil</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.settingItem} onPress={handleChangePassword}>
          <Text style={styles.settingText}>Alterar Senha</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.settingItem} onPress={handleLogout}>
          <Text style={[styles.settingText, styles.logoutText]}>Sair</Text>
        </TouchableOpacity>
      </View>
      
      {/* Privacy & Security Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Privacidade e Segurança</Text>
        <TouchableOpacity style={styles.settingItem} onPress={handlePrivacySettings}>
          <Text style={styles.settingText}>Configurações de Privacidade</Text>
        </TouchableOpacity>
        <View style={styles.settingItem}>
          <Text style={styles.settingText}>Autenticação Biométrica</Text>
          <Switch
            trackColor={{ false: '#767577', true: '#4285F4' }}
            thumbColor={biometricAuth ? '#f4f3f4' : '#f4f3f4'}
            ios_backgroundColor="#3e3e3e"
            onValueChange={setBiometricAuth}
            value={biometricAuth}
          />
        </View>
        <View style={styles.settingItem}>
          <Text style={styles.settingText}>Modo Escuro</Text>
          <Switch
            trackColor={{ false: '#767577', true: '#4285F4' }}
            thumbColor={darkMode ? '#f4f3f4' : '#f4f3f4'}
            ios_backgroundColor="#3e3e3e"
            onValueChange={toggleDarkMode}
            value={darkMode}
          />
        </View>
        <View style={styles.settingItem}>
          <Text style={styles.settingText}>Mostrar Localização</Text>
          <Switch
            trackColor={{ false: '#767577', true: '#4285F4' }}
            thumbColor={location ? '#f4f3f4' : '#f4f3f4'}
            ios_backgroundColor="#3e3e3e"
            onValueChange={setLocation}
            value={location}
          />
        </View>
      </View>
      
      {/* Notifications Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Notificações</Text>
        <View style={styles.settingItem}>
          <Text style={styles.settingText}>Notificações Push</Text>
          <Switch
            trackColor={{ false: '#767577', true: '#4285F4' }}
            thumbColor={notifications ? '#f4f3f4' : '#f4f3f4'}
            ios_backgroundColor="#3e3e3e"
            onValueChange={setNotifications}
            value={notifications}
          />
        </View>
        <TouchableOpacity style={styles.settingItem} onPress={handleNotificationSettings}>
          <Text style={styles.settingText}>Configurações de Notificação</Text>
        </TouchableOpacity>
      </View>
      
      {/* Support Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Suporte</Text>
        <TouchableOpacity style={styles.settingItem} onPress={handleHelp}>
          <Text style={styles.settingText}>Ajuda e Suporte</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.settingItem} onPress={handleContact}>
          <Text style={styles.settingText}>Fale Conosco</Text>
        </TouchableOpacity>
      </View>
      
      {/* About Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Sobre</Text>
        <TouchableOpacity style={styles.settingItem} onPress={handleTerms}>
          <Text style={styles.settingText}>Termos de Uso</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.settingItem} onPress={handlePrivacy}>
          <Text style={styles.settingText}>Política de Privacidade</Text>
        </TouchableOpacity>
        <View style={styles.settingItem}>
          <Text style={styles.settingText}>Versão do App</Text>
          <Text style={styles.settingValue}>1.0.0</Text>
        </View>
        <TouchableOpacity style={styles.settingItem} onPress={handleRateApp}>
          <Text style={styles.settingText}>Avaliar o App</Text>
        </TouchableOpacity>
      </View>
      
      {/* Danger Zone */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Zona de Perigo</Text>
        <TouchableOpacity style={styles.settingItem} onPress={handleDeleteAccount}>
          <Text style={[styles.settingText, styles.dangerText]}>Excluir Conta</Text>
        </TouchableOpacity>
      </View>
      
      {/* Edit Profile Modal */}
      <Modal
        animationType="slide"
        transparent={false}
        visible={showEditProfile}
        onRequestClose={() => setShowEditProfile(false)}
      >
        <ScrollView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowEditProfile(false)}>
              <Text style={styles.closeButton}>✕</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Editar Perfil</Text>
            <TouchableOpacity onPress={saveProfileChanges}>
              <Text style={styles.saveButton}>Salvar</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.modalContent}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Nome de Usuário</Text>
              <TextInput
                style={styles.input}
                value={newUsername}
                onChangeText={setNewUsername}
                placeholder="Seu nome de usuário"
              />
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={styles.input}
                value={newEmail}
                onChangeText={setNewEmail}
                placeholder="Seu email"
                keyboardType="email-address"
              />
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Bio</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={newBio}
                onChangeText={setNewBio}
                placeholder="Conte um pouco sobre você"
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>
          </View>
        </ScrollView>
      </Modal>
      
      {/* Change Password Modal */}
      <Modal
        animationType="slide"
        transparent={false}
        visible={showChangePassword}
        onRequestClose={() => setShowChangePassword(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowChangePassword(false)}>
              <Text style={styles.closeButton}>✕</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Alterar Senha</Text>
            <TouchableOpacity onPress={savePasswordChange}>
              <Text style={styles.saveButton}>Salvar</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.modalContent}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Senha Atual</Text>
              <TextInput
                style={styles.input}
                value={currentPassword}
                onChangeText={setCurrentPassword}
                placeholder="Digite sua senha atual"
                secureTextEntry
              />
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Nova Senha</Text>
              <TextInput
                style={styles.input}
                value={newPassword}
                onChangeText={setNewPassword}
                placeholder="Digite sua nova senha"
                secureTextEntry
              />
              <Text style={styles.helperText}>A senha deve ter pelo menos 6 caracteres</Text>
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Confirmar Nova Senha</Text>
              <TextInput
                style={styles.input}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="Confirme sua nova senha"
                secureTextEntry
              />
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    padding: 20,
    paddingBottom: 10,
  },
  section: {
    backgroundColor: 'white',
    marginBottom: 20,
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  settingText: {
    fontSize: 16,
    color: '#333',
  },
  settingValue: {
    fontSize: 16,
    color: '#666',
  },
  logoutText: {
    color: '#4285F4',
    fontWeight: '600',
  },
  dangerText: {
    color: '#EA4335',
    fontWeight: '600',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  closeButton: {
    fontSize: 24,
    color: '#666',
    fontWeight: 'bold',
  },
  saveButton: {
    fontSize: 16,
    color: '#4285F4',
    fontWeight: '600',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  modalContent: {
    padding: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    color: '#555',
    fontWeight: '600',
  },
  input: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  helperText: {
    fontSize: 12,
    color: '#999',
    marginTop: 5,
  },
});

export default SettingsScreen;