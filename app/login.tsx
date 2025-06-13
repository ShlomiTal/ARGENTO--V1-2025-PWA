import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  KeyboardAvoidingView, 
  Platform, 
  ScrollView,
  Image,
  ActivityIndicator,
  Switch
} from 'react-native';
import { useRouter } from 'expo-router';
import { Eye, EyeOff, Lock, User, AlertCircle } from 'lucide-react-native';
import { useTheme } from '@/components/ThemeProvider';
import { useAuth } from '@/components/AuthProvider';
import { useAuthStore } from '@/store/authStore';
import { useAppLogoStore } from '@/store/appLogoStore';

export default function LoginScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { login, isLoading, error, clearError } = useAuth();
  const { rememberMe, setRememberMe } = useAuthStore();
  const { appLogo } = useAppLogoStore();
  
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [formErrors, setFormErrors] = useState({
    username: '',
    password: '',
  });
  
  // Clear API errors when inputs change
  useEffect(() => {
    if (error) {
      clearError();
    }
  }, [username, password]);
  
  const validateForm = () => {
    let isValid = true;
    const errors = {
      username: '',
      password: '',
    };
    
    if (!username.trim()) {
      errors.username = 'Username is required';
      isValid = false;
    }
    
    if (!password) {
      errors.password = 'Password is required';
      isValid = false;
    }
    
    setFormErrors(errors);
    return isValid;
  };
  
  const handleLogin = async () => {
    if (!validateForm()) {
      return;
    }
    
    const success = await login(username, password);
    
    if (success) {
      // Navigation is handled by AuthProvider
    }
  };
  
  const navigateToRegister = () => {
    router.push('/register');
  };
  
  const navigateToForgotPassword = () => {
    // For now, just show an alert
    alert('Password reset functionality will be available soon.');
  };
  
  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView 
        contentContainerStyle={[styles.container, { backgroundColor: colors.background }]}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.logoContainer}>
          {appLogo ? (
            <Image 
              source={{ uri: appLogo }} 
              style={styles.logo}
              resizeMode="contain"
            />
          ) : (
            <View style={[styles.logoPlaceholder, { backgroundColor: colors.primary }]}>
              <Text style={styles.logoText}>AG</Text>
            </View>
          )}
          <Text style={[styles.appName, { color: colors.text }]}>Argento</Text>
          <Text style={[styles.tagline, { color: colors.textSecondary }]}>
            Your AI-powered trading assistant
          </Text>
        </View>
        
        <View style={styles.formContainer}>
          <Text style={[styles.title, { color: colors.text }]}>Login</Text>
          
          {error && (
            <View style={[styles.errorContainer, { backgroundColor: 'rgba(255, 71, 87, 0.1)' }]}>
              <AlertCircle size={20} color={colors.danger} />
              <Text style={[styles.errorText, { color: colors.danger }]}>{error}</Text>
            </View>
          )}
          
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>Username</Text>
            <View style={[
              styles.inputContainer, 
              { 
                backgroundColor: 'rgba(128, 128, 128, 0.1)',
                borderColor: formErrors.username ? colors.danger : 'transparent',
                borderWidth: formErrors.username ? 1 : 0,
              }
            ]}>
              <User size={20} color={colors.textSecondary} />
              <TextInput
                style={[styles.input, { color: colors.text }]}
                placeholder="Enter your username"
                placeholderTextColor={colors.textSecondary}
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
              />
            </View>
            {formErrors.username ? (
              <Text style={[styles.errorMessage, { color: colors.danger }]}>
                {formErrors.username}
              </Text>
            ) : null}
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>Password</Text>
            <View style={[
              styles.inputContainer, 
              { 
                backgroundColor: 'rgba(128, 128, 128, 0.1)',
                borderColor: formErrors.password ? colors.danger : 'transparent',
                borderWidth: formErrors.password ? 1 : 0,
              }
            ]}>
              <Lock size={20} color={colors.textSecondary} />
              <TextInput
                style={[styles.input, { color: colors.text }]}
                placeholder="Enter your password"
                placeholderTextColor={colors.textSecondary}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                {showPassword ? (
                  <EyeOff size={20} color={colors.textSecondary} />
                ) : (
                  <Eye size={20} color={colors.textSecondary} />
                )}
              </TouchableOpacity>
            </View>
            {formErrors.password ? (
              <Text style={[styles.errorMessage, { color: colors.danger }]}>
                {formErrors.password}
              </Text>
            ) : null}
          </View>
          
          <View style={styles.optionsContainer}>
            <View style={styles.rememberMeContainer}>
              <Switch
                value={rememberMe}
                onValueChange={setRememberMe}
                trackColor={{ false: '#767577', true: colors.primary }}
                thumbColor={rememberMe ? '#f4f3f4' : '#f4f3f4'}
              />
              <Text style={[styles.rememberMeText, { color: colors.text }]}>Remember me</Text>
            </View>
            
            <TouchableOpacity onPress={navigateToForgotPassword}>
              <Text style={[styles.forgotPasswordText, { color: colors.primary }]}>
                Forgot Password?
              </Text>
            </TouchableOpacity>
          </View>
          
          <TouchableOpacity
            style={[styles.loginButton, { backgroundColor: colors.primary }]}
            onPress={handleLogin}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Text style={styles.loginButtonText}>Login</Text>
            )}
          </TouchableOpacity>
          
          <View style={styles.registerContainer}>
            <Text style={[styles.registerText, { color: colors.textSecondary }]}>
              Don't have an account?
            </Text>
            <TouchableOpacity onPress={navigateToRegister}>
              <Text style={[styles.registerLink, { color: colors.primary }]}>
                Register
              </Text>
            </TouchableOpacity>
          </View>
          
          {/* Login hint */}
          <View style={[styles.loginHint, { backgroundColor: 'rgba(108, 92, 231, 0.1)' }]}>
            <Text style={[styles.loginHintText, { color: colors.textSecondary }]}>
              Demo credentials:
            </Text>
            <Text style={[styles.loginHintCredentials, { color: colors.primary }]}>
              Username: Admin
            </Text>
            <Text style={[styles.loginHintCredentials, { color: colors.primary }]}>
              Password: 123456
            </Text>
          </View>
        </View>
        
        <TouchableOpacity 
          style={styles.privacyLink}
          onPress={() => router.push('/privacy-policy')}
        >
          <Text style={[styles.privacyLinkText, { color: colors.textSecondary }]}>
            Privacy Policy
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logo: {
    width: 80,
    height: 80,
    borderRadius: 20,
    marginBottom: 16,
  },
  logoPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  logoText: {
    color: 'white',
    fontSize: 28,
    fontWeight: 'bold',
  },
  appName: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  tagline: {
    fontSize: 16,
    textAlign: 'center',
  },
  formContainer: {
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorText: {
    marginLeft: 8,
    flex: 1,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 50,
  },
  input: {
    flex: 1,
    height: 50,
    marginLeft: 8,
  },
  errorMessage: {
    fontSize: 12,
    marginTop: 4,
  },
  optionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  rememberMeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rememberMeText: {
    marginLeft: 8,
  },
  forgotPasswordText: {
    fontWeight: '500',
  },
  loginButton: {
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  loginButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 16,
  },
  registerText: {
    marginRight: 4,
  },
  registerLink: {
    fontWeight: '500',
  },
  loginHint: {
    marginTop: 24,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  loginHintText: {
    fontSize: 14,
    marginBottom: 4,
  },
  loginHintCredentials: {
    fontSize: 14,
    fontWeight: '600',
  },
  privacyLink: {
    marginTop: 40,
    alignSelf: 'center',
  },
  privacyLinkText: {
    fontSize: 12,
  },
});