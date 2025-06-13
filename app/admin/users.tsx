import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, Modal } from 'react-native';
import { useRouter } from 'expo-router';
import { User, Plus, X, Check, Clock } from 'lucide-react-native';
import { useUserStore } from '@/store/userStore';
import { useTheme } from '@/components/ThemeProvider';
import { HeaderBar } from '@/components/HeaderBar';
import { UserRole } from '@/constants/roles';

export default function AdminUsersScreen() {
  const router = useRouter();
  const { users, addUser, updateUser, deleteUser, toggleUserActive, extendUserTradingTime } = useUserStore();
  const { colors } = useTheme();
  
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [newUserRole, setNewUserRole] = useState<UserRole>('user');
  
  // Format trading time remaining
  const formatTimeRemaining = (endTime: number | null) => {
    if (!endTime) return "No active subscription";
    
    const now = Date.now();
    if (now > endTime) return "Expired";
    
    const timeLeft = endTime - now;
    const hours = Math.floor(timeLeft / (1000 * 60 * 60));
    const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${hours}h ${minutes}m remaining`;
  };
  
  const handleAddUser = () => {
    if (!newUsername.trim()) {
      Alert.alert('Error', 'Username is required');
      return;
    }
    
    addUser({
      username: newUsername.trim(),
      role: newUserRole,
      isActive: true,
      tradingEndTime: newUserRole === 'admin' ? null : (Date.now() + 24 * 60 * 60 * 1000), // 24 hours for regular users
    });
    
    setShowAddUserModal(false);
    setNewUsername('');
    setNewUserRole('user');
    
    Alert.alert('Success', 'User added successfully');
  };
  
  const handleDeleteUser = (userId: string, username: string) => {
    Alert.alert(
      'Delete User',
      `Are you sure you want to delete ${username}?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            deleteUser(userId);
            Alert.alert('Success', 'User deleted successfully');
          },
        },
      ]
    );
  };
  
  const handleToggleUserActive = (userId: string) => {
    toggleUserActive(userId);
  };
  
  const handleExtendUserTime = (userId: string) => {
    Alert.alert(
      "Extend Trading Time",
      "How many hours would you like to add?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "24 Hours",
          onPress: () => {
            extendUserTradingTime(userId, 24);
            Alert.alert('Success', 'Trading time extended by 24 hours');
          }
        },
        {
          text: "48 Hours",
          onPress: () => {
            extendUserTradingTime(userId, 48);
            Alert.alert('Success', 'Trading time extended by 48 hours');
          }
        },
        {
          text: "7 Days",
          onPress: () => {
            extendUserTradingTime(userId, 168);
            Alert.alert('Success', 'Trading time extended by 7 days');
          }
        }
      ]
    );
  };
  
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <HeaderBar />
      
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>User Management</Text>
        
        <TouchableOpacity 
          style={[styles.addButton, { backgroundColor: colors.primary }]}
          onPress={() => setShowAddUserModal(true)}
        >
          <Plus size={20} color={colors.text} />
          <Text style={[styles.addButtonText, { color: colors.text }]}>Add User</Text>
        </TouchableOpacity>
      </View>
      
      <ScrollView style={styles.userList}>
        {users.map(user => (
          <View key={user.id} style={[styles.userCard, { backgroundColor: colors.card }]}>
            <View style={styles.userHeader}>
              <View style={styles.userInfo}>
                <User size={20} color={colors.primary} />
                <View style={styles.userDetails}>
                  <Text style={[styles.username, { color: colors.text }]}>{user.username}</Text>
                  <View style={[
                    styles.roleTag, 
                    { 
                      backgroundColor: user.role === 'admin' 
                        ? 'rgba(108, 92, 231, 0.2)' 
                        : 'rgba(0, 184, 148, 0.2)' 
                    }
                  ]}>
                    <Text style={[
                      styles.roleTagText, 
                      { 
                        color: user.role === 'admin' 
                          ? colors.primary 
                          : colors.success 
                      }
                    ]}>
                      {user.role}
                    </Text>
                  </View>
                </View>
              </View>
              
              <View style={[
                styles.statusTag, 
                { 
                  backgroundColor: user.isActive 
                    ? 'rgba(0, 184, 148, 0.2)' 
                    : 'rgba(255, 107, 107, 0.2)' 
                }
              ]}>
                <Text style={[
                  styles.statusText, 
                  { 
                    color: user.isActive 
                      ? colors.success 
                      : colors.danger 
                  }
                ]}>
                  {user.isActive ? 'Active' : 'Inactive'}
                </Text>
              </View>
            </View>
            
            {user.role === 'user' && (
              <View style={[styles.subscriptionInfo, { backgroundColor: 'rgba(128, 128, 128, 0.1)' }]}>
                <Clock size={16} color={colors.textSecondary} />
                <Text style={[styles.subscriptionText, { color: colors.textSecondary }]}>
                  {formatTimeRemaining(user.tradingEndTime)}
                </Text>
              </View>
            )}
            
            <View style={styles.userActions}>
              <TouchableOpacity 
                style={[
                  styles.userActionButton, 
                  { 
                    backgroundColor: user.isActive 
                      ? 'rgba(255, 107, 107, 0.2)' 
                      : 'rgba(0, 184, 148, 0.2)' 
                  }
                ]}
                onPress={() => handleToggleUserActive(user.id)}
              >
                <Text style={[
                  styles.userActionText, 
                  { 
                    color: user.isActive 
                      ? colors.danger 
                      : colors.success 
                  }
                ]}>
                  {user.isActive ? 'Deactivate' : 'Activate'}
                </Text>
              </TouchableOpacity>
              
              {user.role === 'user' && (
                <TouchableOpacity 
                  style={[styles.userActionButton, { backgroundColor: 'rgba(108, 92, 231, 0.2)' }]}
                  onPress={() => handleExtendUserTime(user.id)}
                >
                  <Text style={[styles.userActionText, { color: colors.primary }]}>
                    Extend Time
                  </Text>
                </TouchableOpacity>
              )}
              
              <TouchableOpacity 
                style={[styles.userActionButton, { backgroundColor: 'rgba(255, 107, 107, 0.2)' }]}
                onPress={() => handleDeleteUser(user.id, user.username)}
              >
                <Text style={[styles.userActionText, { color: colors.danger }]}>
                  Delete
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>
      
      {/* Add User Modal */}
      <Modal
        visible={showAddUserModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowAddUserModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Add New User</Text>
              <TouchableOpacity onPress={() => setShowAddUserModal(false)}>
                <X size={24} color={colors.text} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: colors.text }]}>Username</Text>
              <TextInput
                style={[styles.input, { backgroundColor: 'rgba(128, 128, 128, 0.1)', color: colors.text }]}
                value={newUsername}
                onChangeText={setNewUsername}
                placeholder="Enter username"
                placeholderTextColor={colors.textSecondary}
              />
            </View>
            
            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: colors.text }]}>Role</Text>
              <View style={styles.roleButtons}>
                <TouchableOpacity
                  style={[
                    styles.roleButton,
                    { backgroundColor: 'rgba(128, 128, 128, 0.1)' },
                    newUserRole === 'user' && [styles.activeRoleButton, { backgroundColor: colors.success }]
                  ]}
                  onPress={() => setNewUserRole('user')}
                >
                  <Text
                    style={[
                      styles.roleButtonText,
                      { color: colors.textSecondary },
                      newUserRole === 'user' && { color: '#FFFFFF' }
                    ]}
                  >
                    Regular User
                  </Text>
                  {newUserRole === 'user' && <Check size={16} color="#FFFFFF" style={styles.roleButtonIcon} />}
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[
                    styles.roleButton,
                    { backgroundColor: 'rgba(128, 128, 128, 0.1)' },
                    newUserRole === 'admin' && [styles.activeRoleButton, { backgroundColor: colors.primary }]
                  ]}
                  onPress={() => setNewUserRole('admin')}
                >
                  <Text
                    style={[
                      styles.roleButtonText,
                      { color: colors.textSecondary },
                      newUserRole === 'admin' && { color: '#FFFFFF' }
                    ]}
                  >
                    Administrator
                  </Text>
                  {newUserRole === 'admin' && <Check size={16} color="#FFFFFF" style={styles.roleButtonIcon} />}
                </TouchableOpacity>
              </View>
            </View>
            
            <TouchableOpacity
              style={[styles.addUserButton, { backgroundColor: colors.primary }]}
              onPress={handleAddUser}
            >
              <Text style={styles.addUserButtonText}>Add User</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addButtonText: {
    marginLeft: 6,
    fontWeight: '500',
  },
  userList: {
    padding: 16,
    paddingTop: 0,
  },
  userCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  userHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userDetails: {
    marginLeft: 12,
  },
  username: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  roleTag: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  roleTagText: {
    fontSize: 12,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  statusTag: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  subscriptionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  subscriptionText: {
    marginLeft: 8,
  },
  userActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  userActionButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
    marginLeft: 8,
  },
  userActionText: {
    fontSize: 12,
    fontWeight: '500',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    borderRadius: 12,
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    marginBottom: 8,
    fontSize: 16,
  },
  input: {
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  roleButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  roleButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    marginHorizontal: 4,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  activeRoleButton: {
  },
  roleButtonText: {
    fontWeight: '500',
  },
  roleButtonIcon: {
    marginLeft: 6,
  },
  addUserButton: {
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 16,
  },
  addUserButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
});