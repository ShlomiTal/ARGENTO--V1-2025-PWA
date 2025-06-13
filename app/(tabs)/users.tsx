import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { User, Clock, Shield, UserPlus, Search } from 'lucide-react-native';
import { useUserStore } from '@/store/userStore';
import { useTheme } from '@/components/ThemeProvider';
import { HeaderBar } from '@/components/HeaderBar';

export default function UsersScreen() {
  const router = useRouter();
  const { users, currentUser, role } = useUserStore();
  const { colors } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  
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
  
  const navigateToUserManagement = () => {
    router.push('/admin/users');
  };
  
  // Filter users based on search query
  const filteredUsers = users.filter(user => 
    user.username.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <HeaderBar />
      
      <ScrollView style={styles.content}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>Users</Text>
          
          {(role === 'admin' || (currentUser && currentUser.role === 'admin')) && (
            <TouchableOpacity 
              style={[styles.addButton, { backgroundColor: colors.primary }]}
              onPress={navigateToUserManagement}
            >
              <UserPlus size={20} color={colors.text} />
              <Text style={[styles.addButtonText, { color: colors.text }]}>Manage</Text>
            </TouchableOpacity>
          )}
        </View>
        
        <View style={[styles.searchContainer, { backgroundColor: colors.card }]}>
          <Search size={20} color={colors.textSecondary} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Search users by username..."
            placeholderTextColor={colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Text style={[styles.clearButton, { color: colors.primary }]}>Clear</Text>
            </TouchableOpacity>
          )}
        </View>
        
        <View style={styles.userList}>
          {filteredUsers.length > 0 ? (
            filteredUsers.map(user => (
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
                
                <View style={styles.userStats}>
                  <View style={[styles.statItem, { backgroundColor: 'rgba(108, 92, 231, 0.1)' }]}>
                    <Text style={[styles.statValue, { color: colors.primary }]}>
                      {user.role === 'admin' ? 'Unlimited' : '24h'}
                    </Text>
                    <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Trading Time</Text>
                  </View>
                  
                  <View style={[styles.statItem, { backgroundColor: 'rgba(0, 184, 148, 0.1)' }]}>
                    <Text style={[styles.statValue, { color: colors.success }]}>
                      {user.isActive ? 'Yes' : 'No'}
                    </Text>
                    <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Can Trade</Text>
                  </View>
                  
                  <View style={[styles.statItem, { backgroundColor: 'rgba(255, 107, 107, 0.1)' }]}>
                    <Text style={[styles.statValue, { color: colors.danger }]}>
                      {user.role === 'admin' ? 'All' : 'Limited'}
                    </Text>
                    <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Access Level</Text>
                  </View>
                </View>
                
                {currentUser && currentUser.id === user.id && (
                  <View style={[styles.currentUserBadge, { backgroundColor: colors.primary }]}>
                    <Text style={styles.currentUserText}>Current User</Text>
                  </View>
                )}
              </View>
            ))
          ) : (
            <View style={[styles.emptyState, { backgroundColor: colors.card }]}>
              <Text style={[styles.emptyStateText, { color: colors.textSecondary }]}>
                No users found matching "{searchQuery}"
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 16,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
  },
  clearButton: {
    fontWeight: '500',
    paddingHorizontal: 8,
  },
  userList: {
    padding: 16,
    paddingTop: 0,
  },
  userCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    position: 'relative',
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
  userStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    flex: 1,
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
  },
  currentUserBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  currentUserText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
  },
  emptyState: {
    padding: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyStateText: {
    textAlign: 'center',
  },
});