import React, { useState, useEffect } from 'react';
import {
    KeyboardAvoidingView, StyleSheet, Text, TextInput,
    TouchableOpacity, View, Image, Platform, ScrollView, Alert, ActivityIndicator 
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { auth } from '../firebase';
import { useNavigation } from '@react-navigation/native';


const COLORS = {
    BACKGROUND: '#f0f2f5', 
    DARK_CARD: '#2c3e50', 
    ACCENT_PRIMARY: '#1e88e5', 
    DARK_SUBTLE: '#34495e', 
    DANGER: '#dc3545',
    TEXT_LIGHT: '#ecf0f1',
    TEXT_DARK: '#2c3e50',
    TEXT_SUBTLE: '#95a5a6',
    WHITE: '#fff',
};

export default function Login() {
    const [email, setEmail] = useState('');
    const [senha, setSenha] = useState('');
    const [showSenha, setShowSenha] = useState(false);
    const [isLoading, setIsLoading] = useState(false); 

    const navigation = useNavigation();

    
    const logar = () => {
        if (!email || !senha) {
            Alert.alert("Atenção", "Por favor, preencha seu email e senha.");
            return;
        }

        setIsLoading(true);
        auth
            .signInWithEmailAndPassword(email, senha)
            .then(userCredentials => {
                console.log('Logou como: ', userCredentials.user.email);
            })
            .catch(error => {
                setIsLoading(false);
                let message = "Falha na conexão ou erro desconhecido."; 
                if (error.code === 'auth/invalid-email') {
                    message = "O email fornecido é inválido.";
                } else if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
                    message = "Email ou senha incorretos. Tente novamente.";
                }
                Alert.alert("Erro ao Logar", message);
            });
    };

   
    const resetPassword = () => {
        if (!email) {
            Alert.alert("Atenção", "Preencha seu email no campo para receber o link de recuperação.");
            return;
        }

        auth.sendPasswordResetEmail(email)
            .then(() => {
                Alert.alert(
                    "Email Enviado",
                    `Um link de redefinição de senha foi enviado para ${email}. Verifique sua caixa de entrada.`
                );
            })
            .catch((error) => {
                let message = "Não foi possível enviar o email de recuperação.";
                 if (error.code === 'auth/user-not-found') {
                    message = "Não encontramos um usuário cadastrado com este email.";
                }
                Alert.alert("Erro", message);
            });
    };


    
    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged(user => {
            if (user) navigation.replace("Menu");
        });
        return unsubscribe;
    }, []);

    const irParaRegistro = () => navigation.replace("Registro");

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
        >
            <ScrollView
                contentContainerStyle={styles.scrollContainer}
                keyboardShouldPersistTaps="handled"
            >
                
                <View style={styles.logoContainer}>
                    <Image
                        source={require('../assets/logo.png')}
                        style={styles.logo}
                        resizeMode="contain"
                    />
                  
                </View>


                <View style={styles.formContainer}>
                    <Text style={styles.title}>Acesso ao Sistema</Text>

                    <Text style={styles.label}>Email</Text>
                    <TextInput
                        placeholder="Digite seu email"
                        placeholderTextColor={COLORS.TEXT_SUBTLE}
                        style={styles.input}
                        value={email}
                        onChangeText={setEmail}
                        keyboardType="email-address"
                        autoCapitalize="none"
                    />

                    <Text style={styles.label}>Senha</Text>
                    <View style={styles.passwordContainer}>
                        <TextInput
                            placeholder="Digite sua senha"
                            placeholderTextColor={COLORS.TEXT_SUBTLE}
                            style={styles.passwordInput}
                            value={senha}
                            onChangeText={setSenha}
                            secureTextEntry={!showSenha}
                            autoCapitalize="none"
                        />
                        <TouchableOpacity onPress={() => setShowSenha(!showSenha)} style={styles.eyeIcon}>
                            <MaterialCommunityIcons
                                name={showSenha ? 'eye-off' : 'eye'}
                                size={24}
                                color={COLORS.TEXT_SUBTLE}
                            />
                        </TouchableOpacity>
                    </View>

                    <TouchableOpacity style={styles.loginButton} onPress={logar} disabled={isLoading}>
                        {isLoading ? (
                            <ActivityIndicator size="small" color={COLORS.WHITE} />
                        ) : (
                            <Text style={styles.loginButtonText}>ENTRAR</Text>
                        )}
                    </TouchableOpacity>
                    
                  
                    <TouchableOpacity onPress={resetPassword} style={{ marginTop: 15 }}>
                        <Text style={styles.recoveryText}>Esqueceu a senha?</Text>
                    </TouchableOpacity>


                   
                    <TouchableOpacity onPress={irParaRegistro}>
                        <Text style={styles.registerText}>Não tem conta? Cadastre-se</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    
    COLOR_BACKGROUND: '#f0f2f5', 
    COLOR_DARK_CARD: '#2c3e50', 
    COLOR_DARK_SUBTLE: '#34495e', 
    COLOR_ACCENT_PRIMARY: '#1e88e5', 
    COLOR_DANGER: '#dc3545', 
    TEXT_LIGHT: '#ecf0f1',
    TEXT_DARK: '#2c3e50',
    TEXT_SUBTLE: '#95a5a6',
    WHITE: '#fff',
    
    container: {
        flex: 1,
        backgroundColor: COLORS.BACKGROUND,
    },
    scrollContainer: {
        flexGrow: 1,
        justifyContent: 'center',
        padding: 24,
    },
    
    
    logoContainer: {
        alignSelf: 'center',
        alignItems: 'center',
        marginBottom: 40,
    },
    logo: {
        width: 200, 
        height: 200, 
        marginBottom: 10,
    },
    logoText: {
        fontSize: 28,
        fontWeight: '900',
        color: COLORS.TEXT_DARK,
        marginTop: 10,
    },
    
    
    formContainer: {
        backgroundColor: COLORS.DARK_CARD,
        padding: 30,
        borderRadius: 12,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 5,
        elevation: 8,
    },
    title: {
        fontSize: 24,
        color: COLORS.WHITE,
        marginBottom: 30,
        textAlign: 'center',
        fontWeight: '700',
        letterSpacing: 0.5,
    },
    label: {
        color: COLORS.TEXT_SUBTLE,
        marginBottom: 6,
        marginTop: 15,
        fontSize: 14,
        fontWeight: '600',
    },
    
    
    input: {
        backgroundColor: COLORS.DARK_SUBTLE,
        color: COLORS.TEXT_LIGHT,
        paddingVertical: 12,
        paddingHorizontal: 15,
        borderRadius: 8,
        fontSize: 16,
    },
    passwordContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.DARK_SUBTLE,
        borderRadius: 8,
        paddingHorizontal: 15,
    },
    passwordInput: {
        flex: 1,
        color: COLORS.TEXT_LIGHT,
        fontSize: 16,
        paddingVertical: Platform.OS === 'ios' ? 12 : 10, 
    },
    eyeIcon: {
        paddingLeft: 10,
    },
    
  
    loginButton: {
        backgroundColor: COLORS.ACCENT_PRIMARY,
        marginTop: 30,
        paddingVertical: 15,
        borderRadius: 10,
        shadowColor: COLORS.ACCENT_PRIMARY,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.4,
        shadowRadius: 3,
        elevation: 5,
    },
    loginButtonText: {
        color: COLORS.WHITE,
        fontSize: 18,
        textAlign: 'center',
        fontWeight: '700',
        textTransform: 'uppercase',
    },
    
  
    recoveryText: {
        color: COLORS.TEXT_SUBTLE,
        textAlign: 'center',
        marginTop: 5,
        fontSize: 14,
        textDecorationLine: 'underline',
    },
    registerText: {
        color: COLORS.TEXT_LIGHT,
        textAlign: 'center',
        marginTop: 30,
        fontSize: 14,
        fontWeight: '500',
    },
});