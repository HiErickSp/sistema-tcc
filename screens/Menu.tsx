import React, { useState, useEffect } from 'react';
import { 
    View, 
    Text, 
    StyleSheet, 
    TouchableOpacity, 
    Alert, 
    ActivityIndicator, 
    ScrollView, 
    StatusBar 
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { auth, firestore } from '../firebase';


const COLORS = {
    BACKGROUND: '#f0f2f5',
    CARD_BG: '#2c3e50',       
    ACCENT_PRIMARY: '#1e88e5',
    TEXT_LIGHT: '#ecf0f1',    
    TEXT_DARK: '#2c3e50',     
    TEXT_SUBTLE: '#bdc3c7',
    DANGER: '#e74c3c',
    WHITE: '#fff',
};

const ROTAS_MENU = [
    { 
        name: 'Estoque', 
        label: 'Estoque', 
        icon: 'archive', 
        permission: ['Restrito', 'Intermediário', 'Total'], 
        description: 'Gerenciar Peças e Qtd.',
        color: '#1e88e5'
    },
    { 
        name: 'Manutenções', 
        label: 'Manutenções', 
        icon: 'wrench-clock', 
        permission: ['Restrito', 'Intermediário', 'Total'], 
        description: 'Agenda de Serviços',
        color: '#e67e22' 
    },
    { 
        name: 'Fornecedores', 
        label: 'Fornecedores', 
        icon: 'truck-delivery', 
        permission: ['Intermediário', 'Total'], 
        description: 'Parceiros e Contatos',
        color: '#2ecc71' 
    },
    { 
        name: 'Usuarios', 
        label: 'Usuários', 
        icon: 'account-group', 
        permission: ['Total'], 
        description: 'Acessos do Sistema',
        color: '#9b59b6' 
    },
];

export default function MenuPrincipal() {
    const navigation = useNavigation();
    const [nivelAcesso, setNivelAcesso] = useState(null);
    const [nomeUsuario, setNomeUsuario] = useState('Usuário');
    const [emailUsuario, setEmailUsuario] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const user = auth.currentUser;

        if (user) {
            const refUsuario = firestore.collection("Usuario").doc(user.uid);

            const unsubscribe = refUsuario.onSnapshot(docSnapshot => {
                if (docSnapshot.exists) {
                    const userData = docSnapshot.data();
                    setNivelAcesso(userData.nivel || "Restrito");  
                    setNomeUsuario(userData.nome || user.email);
                    setEmailUsuario(user.email);
                } else {
                    setNivelAcesso("Restrito");
                    setNomeUsuario(user.email);
                    setEmailUsuario(user.email);
                }
                setIsLoading(false);
            }, err => {
                console.error("Erro ao carregar dados:", err);
                setNivelAcesso("Restrito");
                setIsLoading(false);
            });

            return () => unsubscribe();
        } else {
            navigation.replace('Login');
            return () => {};
        }
    }, [navigation]);

    const handleNavigate = (rota) => {
        if (!nivelAcesso) {
            Alert.alert("Aguarde", "Carregando permissões...");
            return;
        }

        if (rota.permission.includes(nivelAcesso)) {
            navigation.navigate(rota.name);
        } else {
            Alert.alert(
                'Acesso Bloqueado',
                `Apenas usuários com nível superior podem acessar ${rota.label}.`
            );
        }
    };

    const handleLogout = () => {
        Alert.alert('Sair', 'Deseja realmente sair?', [
            { text: 'Cancelar', style: 'cancel' },
            { 
                text: 'Sair', 
                style: 'destructive', 
                onPress: () => {
                    auth.signOut()
                        .then(() => navigation.replace('Login'))
                        .catch(error => Alert.alert("Erro", error.message));
                }
            }
        ]);
    };

    if (isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={COLORS.ACCENT_PRIMARY} />
                <Text style={styles.loadingText}>Iniciando sistema...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor={COLORS.BACKGROUND} />

           
            <View style={styles.header}>
                <View>
                    <Text style={styles.greetingText}>Olá, {nomeUsuario.split(' ')[0]}!</Text>
                    <Text style={styles.brandText}>Oficina++</Text>
                </View>
                <View style={styles.logoContainer}>
                    <MaterialCommunityIcons name="car-cog" size={36} color={COLORS.WHITE} />
                </View>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                
                
                <View style={styles.userCard}>
                    <View style={styles.userInfo}>
                        <MaterialCommunityIcons name="shield-account" size={24} color={COLORS.ACCENT_PRIMARY} />
                        <Text style={styles.userEmail}> Nível: </Text>
                        <Text style={styles.accessText}>{(nivelAcesso || "Visitante").toUpperCase()}</Text>
                    </View>
                </View>

               
                <View style={styles.menuGrid}>
                    {ROTAS_MENU.map((rota) => {
                        const isAllowed = rota.permission.includes(nivelAcesso);
                        
                        return (
                            <TouchableOpacity
                                key={rota.name}
                                style={[
                                    styles.cardMenu, 
                                    { borderLeftColor: rota.color },
                                    !isAllowed && styles.cardDisabled
                                ]}
                                onPress={() => handleNavigate(rota)}
                                activeOpacity={0.8}
                            >
                                <View style={[styles.iconCircle, { backgroundColor: rota.color + '25' }]}> 
                                    <MaterialCommunityIcons 
                                        name={rota.icon} 
                                        size={32} 
                                        color={isAllowed ? rota.color : COLORS.TEXT_SUBTLE} 
                                    />
                                </View>
                                
                                <View style={{flex: 1, justifyContent: 'center'}}>
                                    <Text style={[styles.menuLabel, !isAllowed && {color: COLORS.TEXT_SUBTLE}]}>
                                        {rota.label}
                                    </Text>
                                    <Text style={styles.menuDesc} numberOfLines={1}>
                                        {rota.description}
                                    </Text>
                                </View>

                                {isAllowed ? (
                                    <MaterialCommunityIcons name="chevron-right" size={28} color={COLORS.TEXT_SUBTLE} />
                                ) : (
                                    <MaterialCommunityIcons name="lock" size={24} color={COLORS.TEXT_SUBTLE} />
                                )}
                            </TouchableOpacity>
                        );
                    })}
                </View>

                {/* BOTÃO SAIR */}
                <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                    <MaterialCommunityIcons name="logout" size={22} color={COLORS.DANGER} />
                    <Text style={styles.logoutText}>Encerrar Sessão</Text>
                </TouchableOpacity>

            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.BACKGROUND,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: COLORS.BACKGROUND,
    },
    loadingText: {
        marginTop: 10,
        color: COLORS.TEXT_DARK,
        fontWeight: '600'
    },

    
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingTop: 60,
        paddingBottom: 20,
    },
    greetingText: {
        color: '#7f8c8d',
        fontSize: 16,
        fontWeight: '600',
    },
    brandText: {
        color: COLORS.TEXT_DARK,
        fontSize: 30, 
        fontWeight: '900', 
    },
    logoContainer: {
        width: 56, 
        height: 56,
        backgroundColor: COLORS.ACCENT_PRIMARY,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 8,
        shadowColor: COLORS.ACCENT_PRIMARY,
        shadowOpacity: 0.4,
        shadowOffset: { width: 0, height: 4 },
    },

    scrollContent: {
        paddingHorizontal: 24,
        paddingBottom: 40,
    },

    
    userCard: {
        backgroundColor: COLORS.WHITE,
        borderRadius: 12,
        paddingVertical: 12,
        paddingHorizontal: 20,
        marginBottom: 25,
        elevation: 2,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#e0e0e0',
    },
    userInfo: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    userEmail: {
        color: COLORS.TEXT_DARK,
        fontSize: 14,
        marginLeft: 8,
    },
    accessText: {
        color: COLORS.ACCENT_PRIMARY,
        fontWeight: 'bold',
        fontSize: 14,
        letterSpacing: 0.5,
    },

    
    menuGrid: {
        gap: 20, 
    },
    cardMenu: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.CARD_BG,
        padding: 20, 
        borderRadius: 16,
        borderLeftWidth: 6, 
        elevation: 5,
        shadowColor: '#000',
        shadowOpacity: 0.3,
        shadowRadius: 5,
        shadowOffset: { width: 0, height: 3 },
        height: 100, 
    },
    cardDisabled: {
        opacity: 0.6,
        backgroundColor: '#34495e',
    },
    iconCircle: {
        width: 56, 
        height: 56,
        borderRadius: 28,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 20,
    },
    menuLabel: {
        color: COLORS.TEXT_LIGHT,
        fontSize: 20, 
        fontWeight: 'bold',
        marginBottom: 4,
    },
    menuDesc: {
        color: COLORS.TEXT_SUBTLE,
        fontSize: 13,
    },

  
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 40,
        padding: 18,
        borderRadius: 14,
        borderWidth: 2,
        borderColor: '#e0e0e0', 
        backgroundColor: COLORS.WHITE,
    },
    logoutText: {
        color: COLORS.DANGER,
        fontWeight: 'bold',
        fontSize: 16,
        marginLeft: 10,
    },
});