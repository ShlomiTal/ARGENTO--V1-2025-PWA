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
  ActivityIndicator
} from 'react-native';
import { useRouter } from 'expo-router';
import { Eye, EyeOff, Lock, User, Mail, AlertCircle, ArrowLeft, Check, X } from 'lucide-react-native';
import { useTheme } from '@/components/ThemeProvider';
import { useAuth } from '@/components/AuthProvider';
import { useAppLogoStore } from '@/store/appLogoStore';

export default function RegisterScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { register, isLoading, error, clearError } = useAuth();
  const { appLogo } = useAppLogoStore();
  
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formErrors, setFormErrors] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  
  // Password validation criteria
  const [passwordCriteria, setPasswordCriteria] = useState({
    length: false,
    hasLetter: false,
    hasNumber: false,
  });
  
  // Update password criteria when password changes
  useEffect(() => {
    setPasswordCriteria({
      length: password.length >= 8,
      hasLetter: /[a-zA-Z]/.test(password),
      hasNumber: /[0-9]/.test(password),
    });
  }, [password]);
  
  // Clear API errors when inputs change
  useEffect(() => {
    if (error) {
      clearError();
    }
  }, [username, email, password, confirmPassword]);
  
  const validateForm = () => {
    let isValid = true;
    const errors = {
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
    };
    
    // Username validation
    if (!username.trim()) {
      errors.username = 'Username is required';
      isValid = false;
    } else if (username.length < 3) {
      errors.username = 'Username must be at least 3 characters';
      isValid = false;
    }
    
    // Email validation
    if (!email.trim()) {
      errors.email = 'Email is required';
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errors.email = 'Email is invalid';
      isValid = false;
    }
    
    // Password validation
    if (!password) {
      errors.password = 'Password is required';
      isValid = false;
    } else if (password.length < 8) {
      errors.password = 'Password must be at least 8 characters';
      isValid = false;
    } else if (!/[a-zA-Z]/.test(password) || !/[0-9]/.test(password)) {
      errors.password = 'Password must contain letters and numbers';
      isValid = false;
    }
    
    // Confirm password validation
    if (password !== confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
      isValid = false;
    }
    
    setFormErrors(errors);
    return isValid;
  };
  
  const handleRegister = async () => {
    if (!validateForm()) {
      return;
    }
    
    const success = await register(username, email, password);
    
    if (success) {
      // Navigation is handled by AuthProvider
    }
  };
  
  const navigateToLogin = () => {
    router.push('/login');
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
        <TouchableOpacity 
          style={[styles.backButton, { backgroundColor: 'rgba(128, 128, 128, 0.1)' }]}
          onPress={navigateToLogin}
        >
          <ArrowLeft size={20} color={colors.text} />
        </TouchableOpacity>
        
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
        </View>
        
        <View style={styles.formContainer}>
          <Text style={[styles.title, { color: colors.text }]}>Create Account</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Join Argento and start trading with AI assistance
          </Text>
          
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
                placeholder="Choose a username"
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
            <Text style={[styles.label, { color: colors.text }]}>Email</Text>
            <View style={[
              styles.inputContainer, 
              { 
                backgroundColor: 'rgba(128, 128, 128, 0.1)',
                borderColor: formErrors.email ? colors.danger : 'transparent',
                borderWidth: formErrors.email ? 1 : 0,
              }
            ]}>
              <Mail size={20} color={colors.textSecondary} />
              <TextInput
                style={[styles.input, { color: colors.text }]}
                placeholder="Enter your email"
                placeholderTextColor={colors.textSecondary}
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
              />
            </View>
            {formErrors.email ? (
              <Text style={[styles.errorMessage, { color: colors.danger }]}>
                {formErrors.email}
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
                placeholder="Create a password"
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
            
            {/* Password criteria */}
            <View style={styles.passwordCriteria}>
              <View style={styles.criteriaItem}>
                {passwordCriteria.length ? (
                  <Check size={16} color={colors.success} />
                ) : (
                  <X size={16} color={colors.textSecondary} />
                )}
                <Text style={[
                  styles.criteriaText, 
                  { color: passwordCriteria.length ? colors.success : colors.textSecondary }
                ]}>
                  At least 8 characters
                </Text>
              </View>
              
              <View style={styles.criteriaItem}>
                {passwordCriteria.hasLetter ? (
                  <Check size={16} color={colors.success} />
                ) : (
                  <X size={16} color={colors.textSecondary} />
                )}
                <Text style={[
                  styles.criteriaText, 
                  { color: passwordCriteria.hasLetter ? colors.success : colors.textSecondary }
                ]}>
                  Contains letters
                </Text>
              </View>
              
              <View style={styles.criteriaItem}>
                {passwordCriteria.hasNumber ? (
                  <Check size={16} color={colors.success} />
                ) : (
                  <X size={16} color={colors.textSecondary} />
                )}
                <Text style={[
                  styles.criteriaText, 
                  { color: passwordCriteria.hasNumber ? colors.success : colors.textSecondary }
                ]}>
                  Contains numbers
                </Text>
              </View>
            </View>
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>Confirm Password</Text>
            <View style={[
              styles.inputContainer, 
              { 
                backgroundColor: 'rgba(128, 128, 128, 0.1)',
                borderColor: formErrors.confirmPassword ? colors.danger : 'transparent',
                borderWidth: formErrors.confirmPassword ? 1 : 0,
              }
            ]}>
              <Lock size={20} color={colors.textSecondary} />
              <TextInput
                style={[styles.input, { color: colors.text }]}
                placeholder="Confirm your password"
                placeholderTextColor={colors.textSecondary}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showConfirmPassword}
              />
              <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                {showConfirmPassword ? (
                  <EyeOff size={20} color={colors.textSecondary} />
                ) : (
                  <Eye size={20} color={colors.textSecondary} />
                )}
              </TouchableOpacity>
            </View>
            {formErrors.confirmPassword ? (
              <Text style={[styles.errorMessage, { color: colors.danger }]}>
                {formErrors.confirmPassword}
              </Text>
            ) : null}
          </View>
          
          <TouchableOpacity
            style={[styles.registerButton, { backgroundColor: colors.primary }]}
            onPress={handleRegister}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Text style={styles.registerButtonText}>Create Account</Text>
            )}
          </TouchableOpacity>
          
          <View style={styles.loginContainer}>
            <Text style={[styles.loginText, { color: colors.textSecondary }]}>
              Already have an account?
            </Text>
            <TouchableOpacity onPress={navigateToLogin}>
              <Text style={[styles.loginLink, { color: colors.primary }]}>
                Login
              </Text>
            </TouchableOpacity>
          </View>
        </View>
        
        <View style={styles.termsContainer}>
          <Text style={[styles.termsText, { color: colors.textSecondary }]}>
            By creating an account, you agree to our
          </Text>
          <View style={styles.termsLinks}>
            <TouchableOpacity onPress={() => router.push('/privacy-policy')}>
              <Text style={[styles.termsLink, { color: colors.primary }]}>Privacy Policy</Text>
            </TouchableOpacity>
            <Text style={[styles.termsText, { color: colors.textSecondary }]}> and </Text>
            <TouchableOpacity>
              <Text style={[styles.termsLink, { color: colors.primary }]}>Terms of Service</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logo: {
    width: 60,
    height: 60,
    borderRadius: 15,
  },
  logoPlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  formContainer: {
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
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
  passwordCriteria: {
    marginTop: 8,
  },
  criteriaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  criteriaText: {
    fontSize: 12,
    marginLeft: 8,
  },
  registerButton: {
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  registerButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 16,
  },
  loginText: {
    marginRight: 4,
  },
  loginLink: {
    fontWeight: '500',
  },
  termsContainer: {
    marginTop: 40,
    alignItems: 'center',
  },
  termsText: {
    fontSize: 12,
    textAlign: 'center',
  },
  termsLinks: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  termsLink: {
    fontSize: 12,
    fontWeight: '500',
  },
});