import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    FlatList,
    Alert,
    ActivityIndicator
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
    ORANGE: '#e67e22',
};

export default function Estoque() {
    const navigation = useNavigation();
    const isFocused = useIsFocused();

    const [searchText, setSearchText] = useState('');
    const [selectedItem, setSelectedItem] = useState(null);
    const [itens, setItens] = useState([]);
    const [filteredItens, setFilteredItens] = useState([]);
    const [loadingData, setLoadingData] = useState(true);
    const [modoCompras, setModoCompras] = useState(false);

    const hasSelectedItem = selectedItem !== null;

    const dadosObrigatorios = [
        { nome: 'Óleo Motor 5W30 Sintético', codigo: 'OLE-530', qtd: 25 },
        { nome: 'Filtro de Óleo Universal', codigo: 'FIL-001', qtd: 12 },
        { nome: 'Pastilha de Freio Diant.', codigo: 'BRK-099', qtd: 4 },
        { nome: 'Amortecedor Traseiro', codigo: 'SUS-200', qtd: 8 },
        { nome: 'Vela de Ignição NGK', codigo: 'IGN-004', qtd: 40 },
        { nome: 'Correia Dentada', codigo: 'COR-101', qtd: 2 },
        { nome: 'Fluido de Freio DOT4', codigo: 'FLU-002', qtd: 15 },
        { nome: 'Bateria 60Ah', codigo: 'BAT-060', qtd: 1 },
    ];

    const garantirPecasNoBanco = async (snapshot) => {
        const codigosExistentes = new Set();
        snapshot.forEach(doc => {
            const data = doc.data();
            if (data.codigo) codigosExistentes.add(data.codigo);
        });

        const batch = db.batch();
        let precisaSalvar = false;

        dadosObrigatorios.forEach(peca => {
            if (!codigosExistentes.has(peca.codigo)) {
                const docRef = db.collection('pecas').doc();
                batch.set(docRef, peca);
                precisaSalvar = true;
            }
        });

        if (precisaSalvar) {
            try { await batch.commit(); } catch (error) { console.error(error); }
        }
    };

    useEffect(() => {
        setLoadingData(true);
        const unsubscribe = db.collection('pecas').onSnapshot((querySnapshot) => {
            const pecasLista = [];
            querySnapshot.forEach((doc) => {
                pecasLista.push({ ...doc.data(), id: doc.id });
            });
            setItens(pecasLista);
            setLoadingData(false);
            garantirPecasNoBanco(querySnapshot);
        }, (error) => {
            setLoadingData(false);
            Alert.alert("Erro", "Falha na conexão com o banco de dados.");
        });
        return () => unsubscribe();
    }, []);

    useEffect(() => {
        let resultado = itens;
        if (modoCompras) {
            resultado = resultado.filter(item => {
                const qtd = parseInt(item.qtd) || 0;
                return qtd < 6;
            });
        }
        if (searchText !== '') {
            resultado = resultado.filter(item =>
                (item.nome && item.nome.toLowerCase().includes(searchText.toLowerCase())) ||
                (item.codigo && item.codigo.toLowerCase().includes(searchText.toLowerCase()))
            );
        }
        setFilteredItens(resultado);
    }, [searchText, itens, modoCompras]);

    useEffect(() => {
        if (isFocused) setSelectedItem(null);
    }, [isFocused]);

    const handleAdicionar = () => { navigation.navigate('Cadastrar Produto'); };

    const handleEditar = () => {
        if (hasSelectedItem) navigation.navigate('Cadastrar Produto', { item: selectedItem });
        else Alert.alert('Atenção', 'Selecione uma peça na lista para editar.');
    };

    const handleApagar = () => {
        if (!hasSelectedItem) {
            Alert.alert('Atenção', 'Selecione uma peça na lista para apagar.');
            return;
        }
        Alert.alert(
            'Confirmar Exclusão',
            `Tem certeza que deseja apagar a peça "${selectedItem.nome}"?`,
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Apagar',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await db.collection('pecas').doc(selectedItem.id).delete();
                            setSelectedItem(null);
                        } catch (error) {
                             Alert.alert('Erro', `Não foi possível apagar: ${error.message}`);
                        }
                    },
                },
            ]
        );
    };

    const toggleModoCompras = () => {
        setModoCompras(!modoCompras);
        setSelectedItem(null); 
    };

    const renderItem = ({ item }) => {
        const isSelected = selectedItem?.id === item.id;
        const qtd = parseInt(item.qtd) || 0;
        
        let statusColor = COLORS.SUCCESS; 
        if (qtd < 6) statusColor = COLORS.WARNING; 
        if (qtd < 3) statusColor = COLORS.DANGER; 

        return (
            <TouchableOpacity 
                style={[
                    styles.card, 
                    isSelected && styles.cardSelected,
                    { borderLeftColor: statusColor } 
                ]}
                onPress={() => setSelectedItem(isSelected ? null : item)}
                activeOpacity={0.7} 
            >
                <View style={styles.cardInfo}>
                    <Text style={styles.cardTitle} numberOfLines={1}>{item.nome}</Text>
                    <View style={styles.codeRow}>
                        <MaterialCommunityIcons name="barcode" size={14} color={COLORS.TEXT_SUBTLE_ON_DARK} />
                        <Text style={styles.cardCode}>{item.codigo}</Text>
                    </View>
                    <Text style={[styles.statusText, { color: statusColor }]}>
                        {qtd < 3 ? 'Reposição Urgente' : qtd < 6 ? 'Estoque Baixo' : 'Disponível'}
                    </Text>
                </View>

                <View style={styles.cardQtd}>
                    <Text style={[styles.qtdNumber, {color: statusColor}]}>{qtd}</Text>
                    <Text style={styles.qtdLabel}>unid.</Text>
                    
                    {isSelected && (
                        <View style={styles.checkIcon}>
                            <MaterialCommunityIcons name="check-circle" size={20} color={COLORS.ACCENT_PRIMARY} />
                        </View>
                    )}
                </View>
            </TouchableOpacity>
        );
    };
    
    const ListEmptyComponent = () => {
        if (loadingData) {
            return (
                <View style={{padding: 30}}>
                    <ActivityIndicator size="large" color={COLORS.ACCENT_PRIMARY} />
                    <Text style={styles.emptyText}>Carregando estoque...</Text>
                </View>
            );
        }
        if (modoCompras) {
            return (
                <View style={{padding: 20, alignItems: 'center'}}>
                    <MaterialCommunityIcons name="check-circle-outline" size={50} color={COLORS.TEXT_ON_LIGHT} />
                    <Text style={styles.emptyText}>Estoque em dia! Nada urgente para comprar.</Text>
                </View>
            );
        }
        return <Text style={styles.emptyText}>Nenhuma peça encontrada.</Text>;
    };

    return (
        <View style={styles.container}>
            
            <View style={styles.header}>
                <View style={styles.iconContainer}>
                    <MaterialCommunityIcons name="archive-outline" size={30} color={COLORS.WHITE} />
                </View>
                <Text style={styles.tituloHeader}>Controle de Estoque</Text>
            </View>

            <TouchableOpacity 
                style={[styles.botaoAlerta, modoCompras && styles.botaoAlertaAtivo]} 
                onPress={toggleModoCompras}
                activeOpacity={0.8}
            >
                <MaterialCommunityIcons 
                    name={modoCompras ? "format-list-bulleted" : "clipboard-alert-outline"} 
                    size={24} 
                    color={COLORS.WHITE} 
                    style={{marginRight: 10}}
                />
                <Text style={styles.textoBotaoAlerta}>
                    {modoCompras ? "Mostrar Estoque Completo" : "Ver Peças para Comprar"}
                </Text>
            </TouchableOpacity>

            <View style={styles.searchContainer}>
                <MaterialCommunityIcons 
                    name="magnify" 
                    size={22} 
                    color={COLORS.TEXT_SUBTLE_ON_DARK} 
                    style={styles.searchIcon} 
                />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Pesquisar por nome ou código..."
                    placeholderTextColor={COLORS.TEXT_SUBTLE_ON_DARK}
                    value={searchText}
                    onChangeText={setSearchText}
                />
            </View>

            <FlatList
                data={filteredItens}
                renderItem={renderItem}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContent}
                ListEmptyComponent={ListEmptyComponent}
            />

            <View style={styles.botoesContainer}>
                
                <View style={styles.rowButtons}>
                    {/* Botão ADICIONAR */}
                    <TouchableOpacity style={[styles.botao, {flex: 1}]} onPress={handleAdicionar} activeOpacity={0.8}>
                        <MaterialCommunityIcons name="plus" size={20} color={COLORS.WHITE} />
                        <Text style={styles.textoBotao}> Adicionar</Text>
                    </TouchableOpacity>

                    {/* Botão EDITAR */}
                    <TouchableOpacity 
                        style={[styles.botao, styles.botaoEditar, !hasSelectedItem && styles.botaoDisabled]} 
                        onPress={handleEditar} 
                        disabled={!hasSelectedItem}
                    >
                        <MaterialCommunityIcons name="pencil" size={20} color={COLORS.WHITE} />
                        <Text style={styles.textoBotao}> Editar</Text>
                    </TouchableOpacity>

                    {/* Botão APAGAR */}
                    <TouchableOpacity 
                        style={[styles.botao, styles.botaoApagar, !hasSelectedItem && styles.botaoDisabled]} 
                        onPress={handleApagar} 
                        disabled={!hasSelectedItem}
                    >
                        <MaterialCommunityIcons name="delete" size={20} color={COLORS.WHITE} />
                    </TouchableOpacity>
                </View>
            
            
                <TouchableOpacity style={[styles.botao, styles.botaoVoltar]} onPress={() => navigation.goBack()} activeOpacity={0.8}>
                    <MaterialCommunityIcons name="arrow-left-circle-outline" size={20} color={COLORS.WHITE} />
                    <Text style={styles.textoBotao}> Voltar ao Menu</Text>
                </TouchableOpacity>
            </View>

        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.BACKGROUND, 
        paddingHorizontal: 24,
        paddingTop: 35, 
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 20,
    },
    iconContainer: {
        backgroundColor: COLORS.ACCENT_PRIMARY, 
        padding: 10,
        borderRadius: 10, 
        marginRight: 15,
    },
    tituloHeader: { 
        fontSize: 26,
        fontWeight: '900',
        color: COLORS.TEXT_ON_LIGHT, 
    },
    botaoAlerta: {
        flexDirection: 'row',
        backgroundColor: COLORS.ORANGE,
        paddingVertical: 12,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 20,
        elevation: 3,
    },
    botaoAlertaAtivo: {
        backgroundColor: COLORS.ACCENT_PRIMARY,
    },
    textoBotaoAlerta: {
        color: COLORS.WHITE,
        fontWeight: 'bold',
        fontSize: 16,
        textTransform: 'uppercase',
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.WHITE, 
        borderRadius: 12,
        marginBottom: 20,
        elevation: 2,
        borderWidth: 1,
        borderColor: '#e0e0e0',
        height: 50
    },
    searchIcon: { paddingLeft: 15 },
    searchInput: {
        flex: 1,
        height: 50,
        paddingHorizontal: 10,
        fontSize: 16,
        color: COLORS.TEXT_ON_LIGHT,
    },
    listContent: { paddingBottom: 20 },

    
    card: {
        flexDirection: 'row',
        backgroundColor: COLORS.CARD_BG,
        borderRadius: 12,
        marginBottom: 12,
        padding: 15,
        elevation: 3,
        borderLeftWidth: 5, 
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    cardSelected: {
        backgroundColor: '#34495e', 
        borderColor: COLORS.ACCENT_PRIMARY,
        borderWidth: 1,
        borderLeftWidth: 5, 
    },
    cardInfo: {
        flex: 1,
        marginRight: 10,
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: COLORS.TEXT_ON_DARK,
        marginBottom: 4,
    },
    codeRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },
    cardCode: {
        color: COLORS.TEXT_SUBTLE_ON_DARK,
        fontSize: 13,
        marginLeft: 4,
    },
    statusText: {
        fontSize: 11,
        fontWeight: 'bold',
        textTransform: 'uppercase',
    },
    cardQtd: {
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: 50,
    },
    qtdNumber: {
        fontSize: 22,
        fontWeight: 'bold',
    },
    qtdLabel: {
        fontSize: 10,
        color: COLORS.TEXT_SUBTLE_ON_DARK,
    },
    checkIcon: {
        position: 'absolute',
        top: -10,
        right: -10,
    },

    emptyText: {
        textAlign: 'center',
        marginTop: 20,
        fontSize: 16,
        color: COLORS.TEXT_ON_LIGHT, 
        paddingBottom: 20,
    },

    
    botoesContainer: {
        gap: 10, 
        marginTop: 5,
        marginBottom: 20,
    },
    rowButtons: {
        flexDirection: 'row',
        gap: 10,
    },
    
    botao: {
        flexDirection: 'row', 
        backgroundColor: COLORS.ACCENT_PRIMARY,
        paddingVertical: 14,
        paddingHorizontal: 15,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center', 
        elevation: 4,
    },
    botaoEditar: {
        backgroundColor: '#27ae60', 
        flex: 1,
    },
    botaoApagar: {
        backgroundColor: COLORS.DANGER,
        width: 50,
        justifyContent: 'center',
    },
    botaoVoltar: {
        backgroundColor: COLORS.DARK_SUBTLE,
        
    },
    botaoDisabled: {
        backgroundColor: '#bdc3c7',
        elevation: 0,
        opacity: 0.5,
    },
    textoBotao: {
        color: COLORS.WHITE,
        fontWeight: 'bold',
        fontSize: 15,
        marginLeft: 8 
    },
});