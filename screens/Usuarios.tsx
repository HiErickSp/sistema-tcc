import React, { useState, useEffect } from 'react';
import { 
    View, 
    Text, 
    StyleSheet, 
    FlatList, 
    TouchableOpacity, 
    Alert, 
    Modal, 
    TextInput, 
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    ScrollView
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import firebase from "firebase/compat/app";    
import "firebase/compat/auth";
import { auth, firestore } from '../firebase'; 


const COLORS = {
    BACKGROUND: '#f0f2f5',
    CARD_BG: '#2c3e50',
    ACCENT_PRIMARY: '#1e88e5',
    DARK_SUBTLE: '#34495e',
    DANGER: '#e74c3c',
    TEXT_ON_DARK: '#ecf0f1',
    TEXT_SUBTLE_ON_DARK: '#bdc3c7',
    TEXT_ON_LIGHT: '#2c3e50',
    WHITE: '#fff',
    
    LEVEL_TOTAL: '#9b59b6',       
    LEVEL_INTERMEDIATE: '#1e88e5', 
    LEVEL_RESTRICTED: '#95a5a6'    
};

export default function Usuarios() {
    const navigation = useNavigation();

    const [usuarios, setUsuarios] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [searchText, setSearchText] = useState('');
    
    const [usuarioSelecionado, setUsuarioSelecionado] = useState(null);
    const [modalVisivel, setModalVisivel] = useState(false);

    const [formUsuario, setFormUsuario] = useState({
        id: '', nome: '', email: '', nivel: 'Restrito', senha: '', repetirSenha: ''
    });

    const [isSaving, setIsSaving] = useState(false);
    const [loadingData, setLoadingData] = useState(true);
    const [showPassword, setShowPassword] = useState(false); 

    const refUsuario = firestore.collection("Usuario");
    const hasSelectedItem = usuarioSelecionado !== null;

   
    useEffect(() => {
        setLoadingData(true);
        const subscriber = refUsuario.onSnapshot(snapshot => {
            const users = [];
            snapshot.forEach(doc => users.push({ ...doc.data(), id: doc.id }));
            setUsuarios(users);
            setFilteredUsers(users);
            setLoadingData(false);
        });
        return () => subscriber();
    }, []);

    
    useEffect(() => {
        if (searchText === '') {
            setFilteredUsers(usuarios);
        } else {
            const filtered = usuarios.filter(u => 
                (u.nome && u.nome.toLowerCase().includes(searchText.toLowerCase())) ||
                (u.email && u.email.toLowerCase().includes(searchText.toLowerCase()))
            );
            setFilteredUsers(filtered);
        }
    }, [searchText, usuarios]);

    const getSecondaryAuth = () => {
        let secondaryApp = firebase.apps.find(app => app.name === "Secondary");
        if (!secondaryApp) {
            secondaryApp = firebase.initializeApp(firebase.apps[0].options, "Secondary");
        }
        return secondaryApp.auth();
    };

    const abrirModalAdicionar = () => {
        setFormUsuario({ id: '', nome: '', email: '', nivel: 'Restrito', senha: '', repetirSenha: '' });
        setUsuarioSelecionado(null);
        setModalVisivel(true);
    };

    const abrirModalEditar = () => {
        if (!hasSelectedItem) return Alert.alert("Erro", "Selecione um usuário.");
        setFormUsuario({
            id: usuarioSelecionado.id,
            nome: usuarioSelecionado.nome,
            email: usuarioSelecionado.email,
            nivel: usuarioSelecionado.nivel,
            senha: '',
            repetirSenha: ''
        });
        setModalVisivel(true);
    };

    const salvarUsuario = async () => {
        if (!formUsuario.nome || !formUsuario.email || !formUsuario.nivel) {
            Alert.alert("Campos Obrigatórios", "Preencha Nome, Email e Nível.");
            return;
        }

        setIsSaving(true);

        if (formUsuario.id) {
            try {
                await refUsuario.doc(formUsuario.id).update({
                    nome: formUsuario.nome,
                    email: formUsuario.email,
                    nivel: formUsuario.nivel,
                });
                Alert.alert("Sucesso", "Dados atualizados!");
            } catch (error) {
                Alert.alert("Erro", error.message);
            }
            setIsSaving(false);
            setModalVisivel(false);
            setUsuarioSelecionado(null);
            return;
        }

        if (formUsuario.senha !== formUsuario.repetirSenha) {
            Alert.alert("Erro", "As senhas não conferem.");
            setIsSaving(false);
            return;
        }
        if (formUsuario.senha.length < 6) {
            Alert.alert("Erro", "A senha deve ter pelo menos 6 caracteres.");
            setIsSaving(false);
            return;
        }

        try {
            const secondaryAuth = getSecondaryAuth();
            const cred = await secondaryAuth.createUserWithEmailAndPassword(
                formUsuario.email,
                formUsuario.senha
            );

            await refUsuario.doc(cred.user.uid).set({
                nome: formUsuario.nome,
                email: formUsuario.email,
                nivel: formUsuario.nivel,
            });

            await secondaryAuth.signOut();
            Alert.alert("Sucesso", "Novo usuário cadastrado!");
            setModalVisivel(false);
            setUsuarioSelecionado(null);

        } catch (error) {
            Alert.alert("Erro ao criar", error.message);
        } finally {
            setIsSaving(false);
        }
    };

    const apagarUsuario = () => {
        if (!hasSelectedItem) return;
        Alert.alert(
            "Remover Acesso",
            `Tem certeza que deseja remover o usuário "${usuarioSelecionado.nome}"?`,
            [
                { text: "Cancelar", style: "cancel" },
                {
                    text: "Remover",
                    style: "destructive",
                    onPress: async () => {
                        await refUsuario.doc(usuarioSelecionado.id).delete();
                        setUsuarioSelecionado(null);
                    }
                }
            ]
        );
    };

    const renderItem = ({ item }) => {
        const isSelected = usuarioSelecionado?.id === item.id;
        
        let badgeColor = COLORS.LEVEL_RESTRICTED;
        if (item.nivel === 'Total') badgeColor = COLORS.LEVEL_TOTAL;
        if (item.nivel === 'Intermediário') badgeColor = COLORS.LEVEL_INTERMEDIATE;

        const iniciais = item.nome ? item.nome.substring(0, 2).toUpperCase() : "US";

        return (
            <TouchableOpacity
                style={[styles.card, isSelected && styles.cardSelected]}
                onPress={() => setUsuarioSelecionado(isSelected ? null : item)}
                activeOpacity={0.9}
            >
                <View style={styles.cardContent}>
                    <View style={[styles.avatar, { backgroundColor: badgeColor }]}>
                        <Text style={styles.avatarText}>{iniciais}</Text>
                    </View>

                    <View style={styles.infoContainer}>
                        <Text style={styles.cardName}>{item.nome}</Text>
                        <Text style={styles.cardEmail}>{item.email}</Text>
                    </View>

                    <View style={[styles.badge, { borderColor: badgeColor }]}>
                        <Text style={[styles.badgeText, { color: badgeColor }]}>
                            {item.nivel ? item.nivel.toUpperCase() : 'INDEFINIDO'}
                        </Text>
                    </View>
                </View>
                
                {isSelected && (
                    <View style={styles.selectedIndicator}>
                        <MaterialCommunityIcons name="check-circle" size={20} color={COLORS.ACCENT_PRIMARY} />
                    </View>
                )}
            </TouchableOpacity>
        );
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <View style={styles.iconContainer}>
                    <MaterialCommunityIcons name="account-group" size={30} color={COLORS.WHITE} />
                </View>
                <Text style={styles.tituloHeader}>Gestão de Usuários</Text>
            </View>

           
            <View style={styles.searchContainer}>
                <MaterialCommunityIcons name="magnify" size={22} color="#999" style={{marginLeft: 10}} />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Buscar por nome ou email..."
                    placeholderTextColor="#999"
                    value={searchText}
                    onChangeText={setSearchText}
                />
            </View>

            <FlatList
                data={filteredUsers}
                renderItem={renderItem}
                keyExtractor={(i) => i.id}
                contentContainerStyle={styles.listContent}
                ListEmptyComponent={
                    !loadingData && <Text style={styles.emptyText}>Nenhum usuário encontrado.</Text>
                }
            />

            <View style={styles.botoesContainer}>
                <View style={styles.rowButtons}>
                    <TouchableOpacity style={[styles.botao, {flex: 1}]} onPress={abrirModalAdicionar}>
                        <MaterialCommunityIcons name="account-plus" size={20} color={COLORS.WHITE} />
                        <Text style={styles.botaoTexto}> Novo</Text>
                    </TouchableOpacity>

                    <TouchableOpacity 
                        style={[styles.botao, styles.botaoEditar, !hasSelectedItem && styles.botaoDisabled]} 
                        onPress={abrirModalEditar}
                        disabled={!hasSelectedItem}
                    >
                        <MaterialCommunityIcons name="pencil" size={20} color={COLORS.WHITE} />
                        <Text style={styles.botaoTexto}> Editar</Text>
                    </TouchableOpacity>

                    <TouchableOpacity 
                        style={[styles.botao, styles.botaoApagar, !hasSelectedItem && styles.botaoDisabled]} 
                        onPress={apagarUsuario}
                        disabled={!hasSelectedItem}
                    >
                        <MaterialCommunityIcons name="delete" size={20} color={COLORS.WHITE} />
                    </TouchableOpacity>
                </View>

                <TouchableOpacity style={[styles.botao, styles.botaoVoltar]} onPress={() => navigation.goBack()}>
                    <MaterialCommunityIcons name="arrow-left-circle-outline" size={20} color={COLORS.WHITE} style={{marginRight: 8}} />
                    <Text style={styles.botaoTexto}>Voltar ao Menu</Text>
                </TouchableOpacity>
            </View>

            <Modal visible={modalVisivel} transparent animationType="slide">
                <View style={styles.modalOverlay}>
                    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.modalContent}>
                        <ScrollView>
                            <Text style={styles.modalTitle}>
                                {formUsuario.id ? "Editar Dados" : "Novo Usuário"}
                            </Text>

                            <Text style={styles.label}>Nome Completo</Text>
                            <TextInput
                                style={styles.input}
                                value={formUsuario.nome}
                                onChangeText={(t) => setFormUsuario({ ...formUsuario, nome: t })}
                                placeholder="Ex: Carlos Silva"
                                placeholderTextColor={COLORS.TEXT_SUBTLE}
                            />

                            <Text style={styles.label}>E-mail de Acesso</Text>
                            <TextInput
                                style={[styles.input, formUsuario.id && styles.inputDisabled]}
                                value={formUsuario.email}
                                onChangeText={(t) => setFormUsuario({ ...formUsuario, email: t })}
                                placeholder="Ex: carlos@oficina.com"
                                placeholderTextColor={COLORS.TEXT_SUBTLE}
                                editable={!formUsuario.id}
                                autoCapitalize="none"
                                keyboardType="email-address"
                            />

                            <Text style={styles.label}>Nível de Acesso</Text>
                            <View style={styles.segmentedControl}>
                                {["Restrito", "Intermediário", "Total"].map((nivel) => (
                                    <TouchableOpacity
                                        key={nivel}
                                        style={[
                                            styles.segmentBtn,
                                            formUsuario.nivel === nivel && styles.segmentBtnActive
                                        ]}
                                        onPress={() => setFormUsuario({ ...formUsuario, nivel })}
                                    >
                                        <Text style={[
                                            styles.segmentText,
                                            formUsuario.nivel === nivel && styles.segmentTextActive
                                        ]}>{nivel}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>

                            {!formUsuario.id && (
                                <>
                                    <Text style={styles.label}>Senha</Text>
                                    <View style={styles.passwordContainer}>
                                        <TextInput
                                            style={styles.inputPassword}
                                            secureTextEntry={!showPassword}
                                            value={formUsuario.senha}
                                            onChangeText={(t) => setFormUsuario({ ...formUsuario, senha: t })}
                                            placeholder="Mínimo 6 caracteres"
                                            placeholderTextColor={COLORS.TEXT_SUBTLE}
                                        />
                                        <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
                                            <MaterialCommunityIcons name={showPassword ? "eye-off" : "eye"} size={24} color={COLORS.TEXT_SUBTLE} />
                                        </TouchableOpacity>
                                    </View>

                                    <Text style={styles.label}>Confirmar Senha</Text>
                                    <TextInput
                                        style={styles.input}
                                        secureTextEntry={!showPassword}
                                        value={formUsuario.repetirSenha}
                                        onChangeText={(t) => setFormUsuario({ ...formUsuario, repetirSenha: t })}
                                        placeholder="Repita a senha"
                                        placeholderTextColor={COLORS.TEXT_SUBTLE}
                                    />
                                </>
                            )}

                            <View style={styles.modalActions}>
                                <TouchableOpacity style={[styles.modalBtn, styles.btnCancel]} onPress={() => setModalVisivel(false)}>
                                    <Text style={styles.btnText}>Cancelar</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={[styles.modalBtn, styles.btnSave]} onPress={salvarUsuario} disabled={isSaving}>
                                    {isSaving ? <ActivityIndicator color="#fff"/> : <Text style={styles.btnText}>Salvar</Text>}
                                </TouchableOpacity>
                            </View>
                        </ScrollView>
                    </KeyboardAvoidingView>
                </View>
            </Modal>

        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.BACKGROUND, paddingHorizontal: 20, paddingTop: 40 },

    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
    iconContainer: { backgroundColor: COLORS.ACCENT_PRIMARY, padding: 10, borderRadius: 10, marginRight: 15 },
    tituloHeader: { fontSize: 24, fontWeight: 'bold', color: COLORS.TEXT_ON_LIGHT },

    
    searchContainer: {
        flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.WHITE, 
        borderRadius: 12, marginBottom: 15, height: 50, elevation: 3,
        borderWidth: 1, borderColor: '#e0e0e0'
    },
    searchInput: { flex: 1, height: 50, paddingHorizontal: 10, fontSize: 16, color: COLORS.TEXT_ON_LIGHT },

    listContent: { paddingBottom: 20 },

    card: {
        backgroundColor: COLORS.CARD_BG,
        borderRadius: 16,
        padding: 15,
        marginBottom: 12,
        elevation: 4,
        shadowColor: '#000', shadowOpacity: 0.3, shadowOffset: {width:0, height:2}, shadowRadius: 4,
        borderWidth: 1, borderColor: 'transparent'
    },
    cardSelected: {
        borderColor: COLORS.ACCENT_PRIMARY,
        backgroundColor: '#34495e'
    },
    cardContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatar: {
        width: 50, height: 50, borderRadius: 25,
        justifyContent: 'center', alignItems: 'center', marginRight: 15
    },
    avatarText: { color: '#fff', fontWeight: 'bold', fontSize: 18 },
    infoContainer: { flex: 1 },
    cardName: { fontSize: 16, fontWeight: 'bold', color: COLORS.TEXT_ON_DARK },
    cardEmail: { fontSize: 12, color: COLORS.TEXT_SUBTLE },
    
    badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, borderWidth: 1 },
    badgeText: { fontSize: 10, fontWeight: 'bold' },
    
    selectedIndicator: { position: 'absolute', top: 10, right: 10 },

    emptyText: { textAlign: 'center', marginTop: 20, color: COLORS.TEXT_ON_LIGHT },

    botoesContainer: { marginTop: 10, gap: 10, marginBottom: 20 },
    rowButtons: { flexDirection: 'row', gap: 10 },
    
    botao: { flexDirection: 'row', backgroundColor: COLORS.ACCENT_PRIMARY, padding: 15, borderRadius: 12, alignItems: 'center', justifyContent: 'center', elevation: 3 },
    botaoEditar: { backgroundColor: '#27ae60', flex: 1 },
    botaoApagar: { backgroundColor: COLORS.DANGER, width: 50, justifyContent: 'center' },
    botaoVoltar: { backgroundColor: COLORS.DARK_SUBTLE },
    botaoDisabled: { backgroundColor: '#bdc3c7', opacity: 0.5, elevation: 0 },
    botaoTexto: { color: COLORS.WHITE, fontWeight: 'bold', fontSize: 16, textTransform: 'uppercase' },

    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', padding: 20 },
    modalContent: { backgroundColor: COLORS.CARD_BG, borderRadius: 16, padding: 20, maxHeight: '80%' },
    modalTitle: { fontSize: 22, fontWeight: 'bold', color: COLORS.WHITE, marginBottom: 20, textAlign: 'center' },
    label: { color: COLORS.TEXT_SUBTLE, marginTop: 10, marginBottom: 5, fontSize: 12, fontWeight: '600' },
    input: { backgroundColor: COLORS.DARK_SUBTLE, color: COLORS.WHITE, padding: 12, borderRadius: 8, fontSize: 16 },
    inputDisabled: { opacity: 0.6 },
    
    passwordContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.DARK_SUBTLE, borderRadius: 8 },
    inputPassword: { flex: 1, color: COLORS.WHITE, padding: 12, fontSize: 16 },
    eyeIcon: { padding: 10 },

    segmentedControl: { flexDirection: 'row', backgroundColor: COLORS.DARK_SUBTLE, borderRadius: 8, marginTop: 5, padding: 4 },
    segmentBtn: { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 6 },
    segmentBtnActive: { backgroundColor: COLORS.ACCENT_PRIMARY },
    segmentText: { color: COLORS.TEXT_SUBTLE, fontSize: 12 },
    segmentTextActive: { color: COLORS.WHITE, fontWeight: 'bold' },

    modalActions: { flexDirection: 'row', marginTop: 25, gap: 15 },
    modalBtn: { flex: 1, padding: 14, borderRadius: 10, alignItems: 'center' },
    btnCancel: { backgroundColor: COLORS.DANGER },
    btnSave: { backgroundColor: COLORS.ACCENT_PRIMARY },
    btnText: { color: COLORS.WHITE, fontWeight: 'bold', fontSize: 16 },
});