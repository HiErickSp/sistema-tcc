import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Platform,
  ScrollView,
  Image,
  Alert,
  ActivityIndicator
} from 'react-native';
import { auth, firestore } from '../firebase';
import { useNavigation } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';


const COLORS = {
  BG: '#FFFFFF',         
  
  
  INPUT_BG: '#2c2c3e',    
  
  PRIMARY: '#1e88e5',     
  TEXT_MAIN: '#121214',  
  TEXT_INPUT: '#FFFFFF',  
  TEXT_GRAY: '#ccc',    
};

export default function Registro() {
  const navigation = useNavigation();
  
  const [form, setForm] = useState({
    nome: '',
    email: '',
    senha: '',
    fone: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const refUsuario = firestore.collection("Usuario");

  const voltarLogin = () => {
    navigation.replace('Login');
  };

  const handleRegistro = () => {
    if (!form.email || !form.senha || !form.nome || !form.fone) {
      Alert.alert('Atenção', 'Por favor, preencha todos os campos.');
      return;
    }

    setLoading(true);

    auth
      .createUserWithEmailAndPassword(form.email, form.senha)
      .then(userCredentials => {
        const usuario = userCredentials.user;
        
        const idUsuario = refUsuario.doc(usuario.uid);
        idUsuario.set({
          id: usuario.uid,
          nome: form.nome,
          email: form.email,
          fone: form.fone,
          nivel: "Total"  
        });

        Alert.alert("Sucesso", "Conta criada! Bem-vindo à Oficina++");
        navigation.replace('Menu');
      })
      .catch(error => {
        setLoading(false);
        if (error.code === 'auth/email-already-in-use') {
          Alert.alert('Erro', 'Este email já está em uso!');
        } else if (error.code === 'auth/weak-password') {
            Alert.alert('Erro', 'A senha deve ter pelo menos 6 caracteres.');
        } else {
          Alert.alert('Erro', error.message);
        }
      });
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
      
        <View style={styles.header}>
            <Image
            source={require('../assets/logo.png')}
            style={styles.logo}
            resizeMode="contain"
            />
            <Text style={styles.title}>Crie sua conta</Text>
            <Text style={styles.subtitle}>Faça o cadastro para acessar o sistema</Text>
        </View>

       
        <View style={styles.formCard}>
          
         
          <View style={styles.inputContainer}>
            <MaterialCommunityIcons name="account-outline" size={20} color={COLORS.TEXT_GRAY} style={styles.icon} />
            <TextInput
              placeholder="Nome Completo"
              placeholderTextColor="#aaa"
              style={styles.input}
              value={form.nome}
              onChangeText={texto => setForm({ ...form, nome: texto })}
            />
          </View>

         
          <View style={styles.inputContainer}>
            <MaterialCommunityIcons name="email-outline" size={20} color={COLORS.TEXT_GRAY} style={styles.icon} />
            <TextInput
              placeholder="E-mail"
              placeholderTextColor="#aaa"
              style={styles.input}
              keyboardType="email-address"
              autoCapitalize="none"
              value={form.email}
              onChangeText={texto => setForm({ ...form, email: texto })}
            />
          </View>

          
          <View style={styles.inputContainer}>
            <MaterialCommunityIcons name="phone-outline" size={20} color={COLORS.TEXT_GRAY} style={styles.icon} />
            <TextInput
              placeholder="Telefone / WhatsApp"
              placeholderTextColor="#aaa"
              style={styles.input}
              keyboardType="phone-pad"
              value={form.fone}
              onChangeText={texto => setForm({ ...form, fone: texto })}
            />
          </View>

         
          <View style={styles.inputContainer}>
            <MaterialCommunityIcons name="lock-outline" size={20} color={COLORS.TEXT_GRAY} style={styles.icon} />
            <TextInput
              placeholder="Senha "
              placeholderTextColor="#aaa"
              style={styles.input}
              secureTextEntry={!showPassword}
              value={form.senha}
              onChangeText={texto => setForm({ ...form, senha: texto })}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
                <MaterialCommunityIcons 
                    name={showPassword ? "eye-off-outline" : "eye-outline"} 
                    size={20} 
                    color={COLORS.TEXT_GRAY} 
                />
            </TouchableOpacity>
          </View>

        
          <TouchableOpacity 
            style={styles.buttonPrimary} 
            onPress={handleRegistro}
            activeOpacity={0.8}
            disabled={loading}
          >
            {loading ? (
                <ActivityIndicator color="#FFF" />
            ) : (
                <Text style={styles.buttonText}>CADASTRAR</Text>
            )}
          </TouchableOpacity>
        </View>

      
        <TouchableOpacity style={styles.buttonFooter} onPress={voltarLogin}>
          <Text style={styles.textFooter}>Já tem uma conta? <Text style={styles.linkFooter}>Faça Login</Text></Text>
        </TouchableOpacity>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BG,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  
  // HEADER
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logo: {
    width: 150, 
    height: 150,
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.TEXT_MAIN,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
  },

 
  formCard: {
    width: '100%',
  },
  
  
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.INPUT_BG,
    borderRadius: 8,
    marginBottom: 16,
    height: 56,
    paddingHorizontal: 16,
    elevation: 3, 
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  icon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    color: COLORS.TEXT_INPUT, 
    fontSize: 16,
  },
  eyeIcon: {
    padding: 8,
  },

  
  buttonPrimary: {
    backgroundColor: COLORS.PRIMARY,
    height: 56,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
    shadowColor: COLORS.PRIMARY,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 1,
  },

  // FOOTER
  buttonFooter: {
    marginTop: 32,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
  },
  textFooter: {
    color: '#666',
    fontSize: 14,
  },
  linkFooter: {
    color: COLORS.PRIMARY,
    fontWeight: 'bold',
  },
});