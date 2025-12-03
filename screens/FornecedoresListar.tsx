import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    FlatList,
    Alert,
    ActivityIndicator,
    Linking,
    Platform,
    ScrollView 
} from 'react-native';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { firestore as db } from '../firebase'; 


const COLORS = {
    BACKGROUND: '#f0f2f5',       
    CARD_BG: '#2c3e50',          
    ACCENT_PRIMARY: '#1e88e5',   
    DARK_SUBTLE: '#34495e',      
    TEXT_ON_DARK: '#ecf0f1',     
    TEXT_SUBTLE_ON_DARK: '#bdc3c7', 
    TEXT_ON_LIGHT: '#2c3e50',    
    DANGER: '#e74c3c',
    WHITE: '#fff',
    WARNING: '#ffc107', 
    SUCCESS: '#2ecc71',
    MAP_COLOR: '#ea4335',
    WHATSAPP: '#25D366',
};

interface Fornecedor {
    id: string;
    nome: string;
    telefone: string;
    especialidade: string;
    endereco?: string; 
}

const CATEGORIAS = ["Todos", "Peças", "Óleo", "Pneus", "Ferramentas"];

const FornecedoresListar: React.FC = () => {
    const navigation = useNavigation();
    const isFocused = useIsFocused();

    const [searchText, setSearchText] = useState<string>('');
    const [itens, setItens] = useState<Fornecedor[]>([]);
    const [filteredItens, setFilteredItens] = useState<Fornecedor[]>([]);
    const [loadingData, setLoadingData] = useState(true);
    const [filtroCategoria, setFiltroCategoria] = useState("Todos");
    const [selectedItem, setSelectedItem] = useState<Fornecedor | null>(null);

    const hasSelectedItem = selectedItem !== null;

  
    const dadosIniciais = [
        { nome: 'Auto Peças Silva', telefone: '11999991111', especialidade: 'Peças', endereco: 'Av. Paulista, 1000, São Paulo' },
        { nome: 'Rei do Óleo', telefone: '11988882222', especialidade: 'Óleo', endereco: 'Rua Augusta, 500, São Paulo' },
        { nome: 'Borracharia Express', telefone: '11977773333', especialidade: 'Pneus', endereco: 'Rua da Consolação, 200' },
        { nome: 'Ferramentas Pro', telefone: '11966664444', especialidade: 'Ferramentas', endereco: '' },
    ];

    const garantirDadosNoBanco = async (snapshot: any) => {
        const nomesExistentes = new Set();
        snapshot.forEach((doc: any) => {
            const data = doc.data();
            if (data.nome) nomesExistentes.add(data.nome);
        });

        const batch = db.batch();
        let precisaSalvar = false;

        dadosIniciais.forEach((item) => {
            if (!nomesExistentes.has(item.nome)) {
                const docRef = db.collection('fornecedores').doc();
                batch.set(docRef, item);
                precisaSalvar = true;
            }
        });

        if (precisaSalvar) {
            try { await batch.commit(); } catch (error) { console.error(error); }
        }
    };

    
    const handleCall = (fone: string) => {
        const cleanPhone = fone.replace(/[^\d+]/g, '');
        Linking.openURL(`tel:${cleanPhone}`);
    };

    const handleWhatsApp = (fone: string) => {
        const cleanPhone = fone.replace(/[^\d]/g, ''); 
        Linking.openURL(`whatsapp://send?phone=55${cleanPhone}`);
    };

    const handleMap = (endereco: string) => {
        const enderecoEncoded = encodeURIComponent(endereco);
        const url = Platform.select({
            ios: `maps:0,0?q=${enderecoEncoded}`,
            android: `geo:0,0?q=${enderecoEncoded}`,
        });
        const finalUrl = url || `https://www.google.com/maps/search/?api=1&query=${enderecoEncoded}`;
        Linking.openURL(finalUrl).catch(() => Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${enderecoEncoded}`));
    };

    const handleEditar = (item: Fornecedor) => {
        navigation.navigate('FornecedoresManter', { item });
    };

    const handleApagar = (item: Fornecedor) => {
        Alert.alert(
            'Remover Fornecedor',
            `Deseja apagar "${item.nome}"?`,
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Apagar',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await db.collection('fornecedores').doc(item.id).delete();
                        } catch (error) {
                            Alert.alert('Erro', error.message);
                        }
                    },
                },
            ]
        );
    };

    useEffect(() => {
        setLoadingData(true);
        const unsubscribe = db.collection('fornecedores')
            .orderBy('nome') 
            .onSnapshot((querySnapshot) => {
                const lista: Fornecedor[] = []; 
                querySnapshot.forEach((doc) => {
                    const data = doc.data() as Omit<Fornecedor, 'id'>; 
                    lista.push({ id: doc.id, ...data });
                });
                setItens(lista);
                setLoadingData(false);
                garantirDadosNoBanco(querySnapshot);
            }, (error) => {
                setLoadingData(false);
            });
        return () => unsubscribe();
    }, []);

    useEffect(() => {
        let resultado = itens;
        if (filtroCategoria !== "Todos") {
            resultado = resultado.filter(item => 
                item.especialidade && item.especialidade.toLowerCase().includes(filtroCategoria.toLowerCase().slice(0, 3))
            );
        }
        if (searchText !== '') {
            resultado = resultado.filter(item =>
                (item.nome && item.nome.toLowerCase().includes(searchText.toLowerCase())) ||
                (item.especialidade && item.especialidade.toLowerCase().includes(searchText.toLowerCase()))
            );
        }
        setFilteredItens(resultado);
    }, [searchText, itens, filtroCategoria]);


    
    const renderCard = ({ item }: { item: Fornecedor }) => {
        const isSelected = selectedItem?.id === item.id; 
        const hasPhone = item.telefone && item.telefone.trim().length >= 10;
        const hasAddress = item.endereco && item.endereco.trim().length > 0;

        return (
            <TouchableOpacity 
                style={[styles.card, isSelected && styles.cardSelected]} 
                onPress={() => setSelectedItem(isSelected ? null : item)} 
                activeOpacity={0.9}
            >
                <View style={styles.cardHeader}>
                    <View style={{flex: 1}}>
                        <Text style={styles.cardTitle} numberOfLines={1}>{item.nome}</Text>
                        <View style={styles.badgeContainer}>
                            <Text style={styles.badgeText}>{item.especialidade}</Text>
                        </View>
                    </View>
                    
                    <View style={styles.actionIconsRow}>
                        {hasPhone && (
                            <TouchableOpacity onPress={() => handleWhatsApp(item.telefone)} style={[styles.iconBtn, {backgroundColor: COLORS.WHATSAPP}]}>
                                <MaterialCommunityIcons name="whatsapp" size={20} color="#fff" />
                            </TouchableOpacity>
                        )}
                        {hasPhone && (
                            <TouchableOpacity onPress={() => handleCall(item.telefone)} style={[styles.iconBtn, {backgroundColor: COLORS.ACCENT_PRIMARY}]}>
                                <MaterialCommunityIcons name="phone" size={20} color="#fff" />
                            </TouchableOpacity>
                        )}
                    </View>
                </View>

                <View style={styles.cardBody}>
                    <View style={styles.infoRow}>
                        <MaterialCommunityIcons name="phone-classic" size={16} color={COLORS.TEXT_SUBTLE_ON_DARK} />
                        <Text style={styles.infoText}>{item.telefone || "Sem telefone"}</Text>
                    </View>
                    
                    {hasAddress && (
                        <TouchableOpacity onPress={() => handleMap(item.endereco!)} style={styles.infoRow}>
                            <MaterialCommunityIcons name="map-marker" size={16} color={COLORS.MAP_COLOR} />
                            <Text style={[styles.infoText, {color: COLORS.MAP_COLOR, textDecorationLine: 'underline'}]} numberOfLines={1}>
                                {item.endereco}
                            </Text>
                        </TouchableOpacity>
                    )}
                </View>

           
                {isSelected && (
                    <View style={styles.cardFooter}>
                        <TouchableOpacity onPress={() => handleEditar(item)} style={styles.footerBtn}>
                            <MaterialCommunityIcons name="pencil" size={18} color={COLORS.TEXT_SUBTLE_ON_DARK} />
                            <Text style={styles.footerBtnText}>Editar</Text>
                        </TouchableOpacity>
                        <View style={styles.dividerVertical} />
                        <TouchableOpacity onPress={() => handleApagar(item)} style={styles.footerBtn}>
                            <MaterialCommunityIcons name="delete" size={18} color={COLORS.DANGER} />
                            <Text style={[styles.footerBtnText, {color: COLORS.DANGER}]}>Remover</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </TouchableOpacity>
        );
    };

    const handleAdicionar = () => { navigation.navigate('FornecedoresManter'); };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <View>
                    <Text style={styles.headerTitle}>Fornecedores</Text>
                    <Text style={styles.headerSubtitle}>{itens.length} parceiros cadastrados</Text>
                </View>
                <TouchableOpacity onPress={handleAdicionar} style={styles.addBtn}>
                    <MaterialCommunityIcons name="plus" size={28} color="#fff" />
                </TouchableOpacity>
            </View>

            <View style={styles.searchWrapper}>
                <View style={styles.searchContainer}>
                    <MaterialCommunityIcons name="magnify" size={22} color={COLORS.TEXT_SUBTLE_ON_DARK} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Buscar fornecedor..."
                        placeholderTextColor={COLORS.TEXT_SUBTLE_ON_DARK}
                        value={searchText}
                        onChangeText={setSearchText}
                    />
                </View>
            </View>

            <View style={styles.filterWrapper}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{paddingHorizontal: 20}}>
                    {CATEGORIAS.map((cat) => (
                        <TouchableOpacity 
                            key={cat} 
                            style={[
                                styles.filterChip, 
                                filtroCategoria === cat && styles.filterChipActive
                            ]}
                            onPress={() => setFiltroCategoria(cat)}
                        >
                            <Text style={[
                                styles.filterText, 
                                filtroCategoria === cat && styles.filterTextActive
                            ]}>
                                {cat}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            <FlatList
                data={filteredItens}
                renderItem={renderCard}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContent}
                ListEmptyComponent={
                    !loadingData && (
                        <View style={styles.emptyContainer}>
                            <MaterialCommunityIcons name="store-search-outline" size={60} color={COLORS.TEXT_SUBTLE_ON_DARK} />
                            <Text style={styles.emptyText}>Nenhum fornecedor encontrado</Text>
                        </View>
                    )
                }
            />
            
           
            <View style={styles.botoesContainer}>
                <TouchableOpacity style={[styles.botao, styles.botaoVoltar]} onPress={() => navigation.goBack()} activeOpacity={0.8}>
                    <MaterialCommunityIcons name="arrow-left-circle-outline" size={18} color={COLORS.WHITE} />
                    <Text style={styles.textoBotao}> Voltar ao Menu</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

export default FornecedoresListar; 

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.BACKGROUND },
    
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 50,
        paddingBottom: 20,
        backgroundColor: COLORS.BACKGROUND,
    },
    headerTitle: { fontSize: 28, fontWeight: 'bold', color: COLORS.TEXT_ON_LIGHT },
    headerSubtitle: { fontSize: 14, color: '#7f8c8d' },
    addBtn: {
        backgroundColor: COLORS.ACCENT_PRIMARY,
        width: 45, height: 45, borderRadius: 25,
        alignItems: 'center', justifyContent: 'center',
        elevation: 5, shadowColor: COLORS.ACCENT_PRIMARY, shadowOpacity: 0.4, shadowOffset: {width:0, height:4}
    },

    searchWrapper: { backgroundColor: COLORS.BACKGROUND, paddingBottom: 15, paddingHorizontal: 20 },
    searchContainer: {
        flexDirection: 'row', alignItems: 'center',
        backgroundColor: COLORS.WHITE, 
        borderRadius: 12, paddingHorizontal: 15, height: 45,
        borderWidth: 1, borderColor: '#e0e0e0'
    },
    searchInput: { flex: 1, marginLeft: 10, fontSize: 16, color: COLORS.TEXT_ON_LIGHT },

    filterWrapper: { height: 50, backgroundColor: COLORS.BACKGROUND },
    filterChip: {
        paddingHorizontal: 16, paddingVertical: 8,
        backgroundColor: '#e0e0e0', 
        borderRadius: 20,
        marginRight: 10, height: 36, justifyContent: 'center',
        alignSelf: 'center'
    },
    filterChipActive: { backgroundColor: COLORS.CARD_BG }, 
    filterText: { color: COLORS.TEXT_ON_LIGHT, fontWeight: '600', fontSize: 13 },
    filterTextActive: { color: COLORS.WHITE },

    listContent: { padding: 20, paddingBottom: 10 },
    
    
    card: {
        backgroundColor: COLORS.CARD_BG, 
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        elevation: 4,
        shadowColor: '#000', shadowOpacity: 0.3, shadowOffset: {width:0, height:2}, shadowRadius: 4,
        borderLeftWidth: 4,
        borderLeftColor: COLORS.DARK_SUBTLE
    },
    cardSelected: {
        borderLeftColor: COLORS.ACCENT_PRIMARY
    },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
    cardTitle: { fontSize: 18, fontWeight: 'bold', color: COLORS.TEXT_ON_DARK, marginBottom: 4 }, 
    
    badgeContainer: { 
        backgroundColor: COLORS.DARK_SUBTLE, 
        paddingHorizontal: 8, paddingVertical: 4, 
        borderRadius: 6, alignSelf: 'flex-start' 
    },
    badgeText: { color: COLORS.ACCENT_PRIMARY, fontSize: 12, fontWeight: '700', textTransform: 'uppercase' },

    actionIconsRow: { flexDirection: 'row', gap: 10 },
    iconBtn: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },

    cardBody: { marginBottom: 5 },
    infoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
    infoText: { marginLeft: 8, color: COLORS.TEXT_ON_DARK, fontSize: 14 },

    cardFooter: { 
        flexDirection: 'row', borderTopWidth: 1, borderTopColor: COLORS.DARK_SUBTLE, paddingTop: 12, marginTop: 10,
        justifyContent: 'space-around', alignItems: 'center'
    },
    footerBtn: { flexDirection: 'row', alignItems: 'center', padding: 5 },
    footerBtnText: { marginLeft: 6, color: COLORS.TEXT_SUBTLE_ON_DARK, fontWeight: '600', fontSize: 14 },
    dividerVertical: { width: 1, height: 20, backgroundColor: COLORS.DARK_SUBTLE },

    emptyContainer: { alignItems: 'center', marginTop: 50 },
    emptyText: { color: '#7f8c8d', fontSize: 16, marginTop: 10 },

    // BOTÃO VOLTAR
    botoesContainer: {
        paddingHorizontal: 20,
        paddingBottom: 20,
    },
    botao: {
        flexDirection: 'row', 
        backgroundColor: COLORS.ACCENT_PRIMARY,
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center', 
        shadowColor: COLORS.ACCENT_PRIMARY,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.4,
        shadowRadius: 3,
        elevation: 5,
    },
    botaoVoltar: {
        backgroundColor: COLORS.DARK_SUBTLE,
        shadowColor: COLORS.DARK_SUBTLE,
        marginTop: 4,
    },
    textoBotao: {
        color: COLORS.WHITE,
        fontWeight: '700',
        fontSize: 16,
    },
});