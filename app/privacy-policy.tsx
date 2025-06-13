import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useTheme } from '@/components/ThemeProvider';
import { HeaderBar } from '@/components/HeaderBar';

export default function PrivacyPolicyScreen() {
  const { colors } = useTheme();
  
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <HeaderBar />
      
      <ScrollView style={styles.scrollContainer}>
        <View style={styles.content}>
          <Text style={[styles.title, { color: colors.text }]}>Privacy Policy</Text>
          <Text style={[styles.lastUpdated, { color: colors.textSecondary }]}>Last Updated: June 11, 2025</Text>
          
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>1. Introduction</Text>
            <Text style={[styles.paragraph, { color: colors.text }]}>
              Welcome to Argento. We respect your privacy and are committed to protecting your personal data. This privacy policy will inform you about how we look after your personal data when you use our application and tell you about your privacy rights and how the law protects you.
            </Text>
          </View>
          
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>2. Data We Collect</Text>
            <Text style={[styles.paragraph, { color: colors.text }]}>
              We collect and process the following data:
            </Text>
            <View style={styles.bulletList}>
              <View style={styles.bulletItem}>
                <View style={[styles.bullet, { backgroundColor: colors.primary }]} />
                <Text style={[styles.bulletText, { color: colors.text }]}>
                  Account information: username, email address, and password
                </Text>
              </View>
              <View style={styles.bulletItem}>
                <View style={[styles.bullet, { backgroundColor: colors.primary }]} />
                <Text style={[styles.bulletText, { color: colors.text }]}>
                  API keys that you provide to connect to cryptocurrency exchanges
                </Text>
              </View>
              <View style={styles.bulletItem}>
                <View style={[styles.bullet, { backgroundColor: colors.primary }]} />
                <Text style={[styles.bulletText, { color: colors.text }]}>
                  Trading data and portfolio information
                </Text>
              </View>
              <View style={styles.bulletItem}>
                <View style={[styles.bullet, { backgroundColor: colors.primary }]} />
                <Text style={[styles.bulletText, { color: colors.text }]}>
                  Usage data and analytics to improve our service
                </Text>
              </View>
            </View>
          </View>
          
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>3. How We Use Your Data</Text>
            <Text style={[styles.paragraph, { color: colors.text }]}>
              We use your data for the following purposes:
            </Text>
            <View style={styles.bulletList}>
              <View style={styles.bulletItem}>
                <View style={[styles.bullet, { backgroundColor: colors.primary }]} />
                <Text style={[styles.bulletText, { color: colors.text }]}>
                  To provide and maintain our service
                </Text>
              </View>
              <View style={styles.bulletItem}>
                <View style={[styles.bullet, { backgroundColor: colors.primary }]} />
                <Text style={[styles.bulletText, { color: colors.text }]}>
                  To execute trades on your behalf when you enable automated trading
                </Text>
              </View>
              <View style={styles.bulletItem}>
                <View style={[styles.bullet, { backgroundColor: colors.primary }]} />
                <Text style={[styles.bulletText, { color: colors.text }]}>
                  To notify you about changes to our service
                </Text>
              </View>
              <View style={styles.bulletItem}>
                <View style={[styles.bullet, { backgroundColor: colors.primary }]} />
                <Text style={[styles.bulletText, { color: colors.text }]}>
                  To improve our application and user experience
                </Text>
              </View>
            </View>
          </View>
          
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>4. Security</Text>
            <Text style={[styles.paragraph, { color: colors.text }]}>
              We take the security of your data seriously. Your API keys are encrypted and stored securely on your device. We do not store your API keys on our servers. We implement appropriate security measures to protect against unauthorized access, alteration, disclosure, or destruction of your personal data.
            </Text>
          </View>
          
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>5. Your Rights</Text>
            <Text style={[styles.paragraph, { color: colors.text }]}>
              You have the right to:
            </Text>
            <View style={styles.bulletList}>
              <View style={styles.bulletItem}>
                <View style={[styles.bullet, { backgroundColor: colors.primary }]} />
                <Text style={[styles.bulletText, { color: colors.text }]}>
                  Access your personal data
                </Text>
              </View>
              <View style={styles.bulletItem}>
                <View style={[styles.bullet, { backgroundColor: colors.primary }]} />
                <Text style={[styles.bulletText, { color: colors.text }]}>
                  Correct any inaccurate personal data
                </Text>
              </View>
              <View style={styles.bulletItem}>
                <View style={[styles.bullet, { backgroundColor: colors.primary }]} />
                <Text style={[styles.bulletText, { color: colors.text }]}>
                  Request erasure of your personal data
                </Text>
              </View>
              <View style={styles.bulletItem}>
                <View style={[styles.bullet, { backgroundColor: colors.primary }]} />
                <Text style={[styles.bulletText, { color: colors.text }]}>
                  Object to processing of your personal data
                </Text>
              </View>
              <View style={styles.bulletItem}>
                <View style={[styles.bullet, { backgroundColor: colors.primary }]} />
                <Text style={[styles.bulletText, { color: colors.text }]}>
                  Request restriction of processing your personal data
                </Text>
              </View>
            </View>
          </View>
          
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>6. Changes to This Privacy Policy</Text>
            <Text style={[styles.paragraph, { color: colors.text }]}>
              We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last Updated" date at the top of this Privacy Policy.
            </Text>
          </View>
          
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>7. Contact Us</Text>
            <Text style={[styles.paragraph, { color: colors.text }]}>
              If you have any questions about this Privacy Policy, please contact us at:
            </Text>
            <Text style={[styles.contactInfo, { color: colors.primary }]}>
              support@argento.com
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  lastUpdated: {
    fontSize: 14,
    marginBottom: 24,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  paragraph: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 12,
  },
  bulletList: {
    marginTop: 8,
  },
  bulletItem: {
    flexDirection: 'row',
    marginBottom: 8,
    alignItems: 'flex-start',
  },
  bullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 8,
    marginRight: 8,
  },
  bulletText: {
    fontSize: 16,
    lineHeight: 24,
    flex: 1,
  },
  contactInfo: {
    fontSize: 16,
    fontWeight: '500',
    marginTop: 8,
  },
});