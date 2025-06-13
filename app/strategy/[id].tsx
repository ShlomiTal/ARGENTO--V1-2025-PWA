import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Picker } from '@react-native-picker/picker';
import { colors } from '@/constants/colors';
import { cryptos } from '@/constants/cryptos';
import { strategyTypes } from '@/constants/strategies';
import { useBotStore } from '@/store/botStore';

export default function EditStrategyScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { strategies, updateStrategy, removeStrategy } = useBotStore();
  
  const strategy = strategies.find((s) => s.id === id);
  
  const [name, setName] = useState('');
  const [cryptoId, setCryptoId] = useState('');
  const [strategyType, setStrategyType] = useState('');
  const [parameters, setParameters] = useState<Record<string, any>>({});
  const [active, setActive] = useState(false);
  
  useEffect(() => {
    if (strategy) {
      setName(strategy.name);
      setCryptoId(strategy.cryptoId);
      setStrategyType(strategy.type);
      setParameters(strategy.parameters);
      setActive(strategy.active);
    }
  }, [strategy]);
  
  const selectedStrategy = strategyTypes.find((s) => s.id === strategyType);
  
  const handleParameterChange = (paramId: string, value: string) => {
    setParameters({
      ...parameters,
      [paramId]: parseFloat(value),
    });
  };
  
  const handleUpdateStrategy = () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter a strategy name');
      return;
    }
    
    if (!strategy) {
      Alert.alert('Error', 'Strategy not found');
      return;
    }
    
    // Set default parameters if not provided
    const finalParameters: Record<string, any> = {};
    selectedStrategy?.parameters.forEach((param) => {
      finalParameters[param.id] = parameters[param.id] !== undefined 
        ? parameters[param.id] 
        : param.default;
    });
    
    updateStrategy(strategy.id, {
      name: name.trim(),
      cryptoId,
      type: strategyType,
      parameters: finalParameters,
      active,
    });
    
    router.back();
  };
  
  const handleDeleteStrategy = () => {
    Alert.alert(
      "Delete Strategy",
      "Are you sure you want to delete this strategy?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            if (strategy) {
              removeStrategy(strategy.id);
              router.back();
            }
          }
        }
      ]
    );
  };
  
  if (!strategy) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Strategy not found</Text>
      </View>
    );
  }
  
  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Edit Trading Strategy</Text>
        
        <View style={styles.formGroup}>
          <Text style={styles.label}>Strategy Name</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Enter strategy name"
            placeholderTextColor={colors.textSecondary}
          />
        </View>
        
        <View style={styles.formGroup}>
          <Text style={styles.label}>Cryptocurrency</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={cryptoId}
              onValueChange={(value) => setCryptoId(value)}
              style={styles.picker}
              dropdownIconColor={colors.text}
            >
              {cryptos.map((crypto) => (
                <Picker.Item
                  key={crypto.id}
                  label={`${crypto.name} (${crypto.symbol})`}
                  value={crypto.id}
                  color={colors.text}
                />
              ))}
            </Picker>
          </View>
        </View>
        
        <View style={styles.formGroup}>
          <Text style={styles.label}>Strategy Type</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={strategyType}
              onValueChange={(value) => setStrategyType(value)}
              style={styles.picker}
              dropdownIconColor={colors.text}
            >
              {strategyTypes.map((strategy) => (
                <Picker.Item
                  key={strategy.id}
                  label={strategy.name}
                  value={strategy.id}
                  color={colors.text}
                />
              ))}
            </Picker>
          </View>
        </View>
        
        {selectedStrategy && (
          <View style={styles.parametersContainer}>
            <Text style={styles.parametersTitle}>Strategy Parameters</Text>
            <Text style={styles.parametersDescription}>
              {selectedStrategy.description}
            </Text>
            
            {selectedStrategy.parameters.map((param) => (
              <View key={param.id} style={styles.formGroup}>
                <Text style={styles.label}>{param.name}</Text>
                <TextInput
                  style={styles.input}
                  value={
                    parameters[param.id] !== undefined
                      ? parameters[param.id].toString()
                      : param.default.toString()
                  }
                  onChangeText={(value) => handleParameterChange(param.id, value)}
                  placeholder={param.default.toString()}
                  placeholderTextColor={colors.textSecondary}
                  keyboardType="numeric"
                />
              </View>
            ))}
          </View>
        )}
        
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.updateButton}
            onPress={handleUpdateStrategy}
          >
            <Text style={styles.buttonText}>Update Strategy</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={handleDeleteStrategy}
          >
            <Text style={styles.buttonText}>Delete Strategy</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: 16,
  },
  title: {
    color: colors.text,
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    color: colors.text,
    marginBottom: 8,
    fontSize: 16,
  },
  input: {
    backgroundColor: colors.card,
    borderRadius: 8,
    padding: 12,
    color: colors.text,
    fontSize: 16,
  },
  pickerContainer: {
    backgroundColor: colors.card,
    borderRadius: 8,
    overflow: 'hidden',
  },
  picker: {
    color: colors.text,
    backgroundColor: 'transparent',
  },
  parametersContainer: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginVertical: 16,
  },
  parametersTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  parametersDescription: {
    color: colors.textSecondary,
    marginBottom: 16,
  },
  buttonContainer: {
    marginTop: 16,
  },
  updateButton: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  deleteButton: {
    backgroundColor: colors.danger,
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  buttonText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
  errorText: {
    color: colors.text,
    fontSize: 18,
    textAlign: 'center',
    marginTop: 24,
  },
});