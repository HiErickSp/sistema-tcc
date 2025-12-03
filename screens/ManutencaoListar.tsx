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
    Linking
} from 'react-native';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { firestore as db } from '../firebase'; 

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
    WARNING: '#ffc107', 
    SUCCESS: '#2ecc71',
    ORANGE: '#e67e22', 
    WHATSAPP: '#25D366', 
};

type ManutencaoStatus = 'Agendado' | 'Em Andamento' | 'Concluído';

interface Manutencao {
    id: string;
    cliente: string;
    veiculo: string;
    servico: string;
    status: ManutencaoStatus;
    data: any; 
    telefone: string; 
}

const formatarData = (timestamp: any): string => {
    if (!timestamp) return 'N/D';
    if (timestamp.toDate) {
        const data = timestamp.toDate();
        return data.toLocaleDateString('pt-BR');
    }
    try {
        const data = new Date(timestamp);
        return data.toLocaleDateString('pt-BR');
    } catch (e) {
        return 'Data Inválida';
    }
};

const ManutencaoListar: React.FC = () => {
    const navigation = useNavigation();
    const isFocused = useIsFocused();

    const [searchText, setSearchText] = useState<string>('');
    const [itens, setItens] = useState<Manutencao[]>([]);
    const [filteredItens, setFilteredItens] = useState<Manutencao[]>([]);
    const [loadingData, setLoadingData] = useState(true);
    
   
    const [filtroStatus, setFiltroStatus] = useState<'Todos' | 'Agendados' | 'EmAndamento' | 'Concluidos'>('Agendados');

    const dadosIniciais = [
        { cliente: 'João Silva', telefone: '11999999999', veiculo: 'Fiat Uno 2010', servico: 'Troca de Óleo', status: 'Agendado', data: new Date() },
        { cliente: 'Maria Oliveira', telefone: '21988888888', veiculo: 'Honda Civic', servico: 'Revisão Freios', status: 'Em Andamento', data: new Date() },
        { cliente: 'Transportadora A', telefone: '31977777777', veiculo: 'Caminhão Vw', servico: 'Suspensão', status: 'Agendado', data: new Date() },
        { cliente: 'Pedro Santos', telefone: '41966666666', veiculo: 'Gol G5', servico: 'Alinhamento', status: 'Concluído', data: new Date(Date.now() - 86400000) },
    ];

    const garantirDadosNoBanco = async (snapshot: any) => {
        if (snapshot.empty) {
            const batch = db.batch();
            dadosIniciais.forEach((item) => {
                const docRef = db.collection('manutencoes').doc();
                batch.set(docRef, item);
            });
            try { await batch.commit(); } catch (error) { console.error(error); }
        }
    };

    useEffect(() => {
        setLoadingData(true);
        const unsubscribe = db.collection('manutencoes')
            .orderBy('data', 'desc')
            .onSnapshot((querySnapshot) => {
                const lista: Manutencao[] = []; 
                querySnapshot.forEach((doc) => {
                    const data = doc.data() as Omit<Manutencao, 'id'>; 
                    lista.push({ id: doc.id, ...data });
                });
                setItens(lista);
                setLoadingData(false);
                garantirDadosNoBanco(querySnapshot);
            }, (error) => {
                setLoadingData(false);
                Alert.alert("Erro", "Não foi possível carregar os serviços.");
            });
        return () => unsubscribe();
    }, []);

    useEffect(() => {
        let resultado = itens;

       
        if (filtroStatus === 'Agendados') {
            resultado = resultado.filter(item => item.status === 'Agendado');
        } 
        else if (filtroStatus === 'EmAndamento') {
        
            resultado = resultado.filter(item => item.status === 'Em Andamento');
        } 
        else if (filtroStatus === 'Concluidos') {
            resultado = resultado.filter(item => item.status === 'Concluído');
        }
     

        if (searchText !== '') {
            resultado = resultado.filter(item =>
                (item.cliente && item.cliente.toLowerCase().includes(searchText.toLowerCase())) ||
                (item.veiculo && item.veiculo.toLowerCase().includes(searchText.toLowerCase()))
            );
        }
        
        setFilteredItens(resultado);
    }, [searchText, itens, filtroStatus]);

  
    const handleAdicionar = () => { navigation.navigate('ManutencaoManter'); };
    
    const handleEditar = (item: Manutencao) => {
        navigation.navigate('ManutencaoManter', { item });
    };

    const handleIniciar = async (item: Manutencao) => {
        try {
            await db.collection('manutencoes').doc(item.id).update({ status: 'Em Andamento' });
        } catch (error) {
            Alert.alert("Erro", "Não foi possível iniciar o serviço.");
        }
    };

    const handleConcluir = async (item: Manutencao) => {
        try {
            await db.collection('manutencoes').doc(item.id).update({ status: 'Concluído' });
            Alert.alert("Sucesso", "Serviço finalizado!");
        } catch (error) {
            Alert.alert("Erro", "Não foi possível concluir.");
        }
    };

    const handleApagar = (item: Manutencao) => {
        Alert.alert('Excluir', `Apagar serviço de ${item.cliente}?`, [
            { text: 'Cancelar', style: 'cancel' },
            { text: 'Apagar', style: 'destructive', onPress: async () => {
                try {
                    await db.collection('manutencoes').doc(item.id).delete();
                } catch (error) { Alert.alert('Erro', error.message); }
            }},
        ]);
    };

    const handleLigar = (fone: string) => {
        if (!fone) return Alert.alert("Erro", "Sem telefone.");
        Linking.openURL(`tel:${fone}`);
    };

    const handleWhatsApp = (fone: string, cliente: string, veiculo: string) => {
        if (!fone) return Alert.alert("Erro", "Sem telefone.");
        const numeroLimpo = fone.replace(/\D/g, '');
        const mensagem = `Olá ${cliente}, estamos entrando em contato sobre o serviço do veículo ${veiculo}.`;
        Linking.openURL(`whatsapp://send?phone=55${numeroLimpo}&text=${encodeURIComponent(mensagem)}`);
    };

    // --- CARD DE MANUTENÇÃO ---
    const renderItem = ({ item }: { item: Manutencao }) => {
        let corStatus = COLORS.TEXT_SUBTLE_ON_DARK; 
        let iconeStatus = "clock-outline";

        if (item.status === 'Em Andamento') { corStatus = COLORS.WARNING; iconeStatus = "progress-wrench"; }
        if (item.status === 'Agendado') { corStatus = COLORS.ACCENT_PRIMARY; iconeStatus = "calendar-clock"; }
        if (item.status === 'Concluído') { corStatus = COLORS.SUCCESS; iconeStatus = "check-circle"; }

        return (
            <View style={[styles.card, { borderLeftColor: corStatus, borderLeftWidth: 4 }]}>
                <View style={styles.cardHeader}>
                    <View style={{flex: 1}}>
                        <Text style={styles.cardTitle} numberOfLines={1}>{item.cliente}</Text>
                        <Text style={styles.cardSubtitle}>{item.veiculo}</Text>
                    </View>
                    <View style={styles.contactRow}>
                        {item.telefone && (
                            <>
                                <TouchableOpacity onPress={() => handleWhatsApp(item.telefone, item.cliente, item.veiculo)} style={[styles.iconBtn, {backgroundColor: COLORS.WHATSAPP}]}>
                                    <MaterialCommunityIcons name="whatsapp" size={18} color="#fff" />
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => handleLigar(item.telefone)} style={[styles.iconBtn, {backgroundColor: COLORS.ACCENT_PRIMARY}]}>
                                    <MaterialCommunityIcons name="phone" size={18} color="#fff" />
                                </TouchableOpacity>
                            </>
                        )}
                    </View>
                </View>

                <View style={styles.cardBody}>
                    <Text style={styles.serviceText}>{item.servico}</Text>
                    <View style={styles.dateRow}>
                        <MaterialCommunityIcons name="calendar-month" size={16} color={COLORS.TEXT_SUBTLE_ON_DARK} />
                        <Text style={styles.dateText}>{formatarData(item.data)}</Text>
                    </View>
                </View>

                <View style={styles.statusRow}>
                    <View style={[styles.statusBadge, { borderColor: corStatus }]}>
                        <MaterialCommunityIcons name={iconeStatus as any} size={14} color={corStatus} />
                        <Text style={[styles.statusText, { color: corStatus }]}>{item.status}</Text>
                    </View>

                    {item.status === 'Agendado' && (
                        <TouchableOpacity onPress={() => handleIniciar(item)} style={styles.startBtn}>
                            <Text style={styles.checkBtnText}>Iniciar</Text>
                            <MaterialCommunityIcons name="play" size={16} color={COLORS.WHITE} />
                        </TouchableOpacity>
                    )}

                    {item.status === 'Em Andamento' && (
                        <TouchableOpacity onPress={() => handleConcluir(item)} style={styles.checkBtn}>
                            <Text style={styles.checkBtnText}>Concluir</Text>
                            <MaterialCommunityIcons name="check" size={16} color={COLORS.WHITE} />
                        </TouchableOpacity>
                    )}
                </View>

                <View style={styles.cardFooter}>
                    <TouchableOpacity onPress={() => handleEditar(item)} style={styles.footerBtn}>
                        <MaterialCommunityIcons name="pencil" size={18} color={COLORS.TEXT_SUBTLE_ON_DARK} />
                        <Text style={styles.footerBtnText}>Editar</Text>
                    </TouchableOpacity>
                    <View style={styles.dividerVertical} />
                    <TouchableOpacity onPress={() => handleApagar(item)} style={styles.footerBtn}>
                        <MaterialCommunityIcons name="delete" size={18} color={COLORS.DANGER} />
                        <Text style={[styles.footerBtnText, {color: COLORS.DANGER}]}>Excluir</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    };

    const ListEmptyComponent = () => {
        if (loadingData) return <ActivityIndicator size="large" color={COLORS.ACCENT_PRIMARY} style={{marginTop: 20}} />;
        return <Text style={styles.emptyText}>Nenhum serviço encontrado.</Text>;
    };

    return (
        <View style={styles.container}>
            
            <View style={styles.header}>
                <View style={styles.iconContainer}>
                    <MaterialCommunityIcons name="wrench-clock" size={30} color={COLORS.WHITE} />
                </View>
                <Text style={styles.tituloHeader}>Agenda de Serviços</Text>
            </View>

            
            <View style={styles.tabsContainer}>
                <TouchableOpacity 
                    style={[styles.tabButton, filtroStatus === 'Agendados' && styles.tabActive]} 
                    onPress={() => setFiltroStatus('Agendados')}
                >
                    <Text style={[styles.tabText, filtroStatus === 'Agendados' && styles.tabTextActive]}>Agendados</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                    style={[styles.tabButton, filtroStatus === 'EmAndamento' && styles.tabActive]} 
                    onPress={() => setFiltroStatus('EmAndamento')}
                >
                    <Text style={[styles.tabText, filtroStatus === 'EmAndamento' && styles.tabTextActive]}>Em Andamento</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                    style={[styles.tabButton, filtroStatus === 'Concluidos' && styles.tabActive]} 
                    onPress={() => setFiltroStatus('Concluidos')}
                >
                    <Text style={[styles.tabText, filtroStatus === 'Concluidos' && styles.tabTextActive]}>Concluídos</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                    style={[styles.tabButton, filtroStatus === 'Todos' && styles.tabActive]} 
                    onPress={() => setFiltroStatus('Todos')}
                >
                    <Text style={[styles.tabText, filtroStatus === 'Todos' && styles.tabTextActive]}>Todos</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.searchContainer}>
                <MaterialCommunityIcons name="magnify" size={22} color={COLORS.TEXT_SUBTLE_ON_DARK} style={{marginLeft: 10}} />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Buscar cliente ou veículo..."
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
                <View style={styles.primaryActionsRow}>
                    <TouchableOpacity style={[styles.botao, styles.halfWidth]} onPress={handleAdicionar} activeOpacity={0.8}>
                        <MaterialCommunityIcons name="plus" size={18} color={COLORS.WHITE} />
                        <Text style={styles.textoBotao}> Novo Agendamento</Text>
                    </TouchableOpacity>
                </View>
            
                <TouchableOpacity style={[styles.botao, styles.botaoVoltar]} onPress={() => navigation.goBack()} activeOpacity={0.8}>
                    <MaterialCommunityIcons name="arrow-left-circle-outline" size={18} color={COLORS.WHITE} />
                    <Text style={styles.textoBotao}> Voltar ao Menu</Text>
                </TouchableOpacity>
            </View>

        </View>
    );
}

export default ManutencaoListar; 

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.BACKGROUND, 
        paddingHorizontal: 20,
        paddingTop: 40, 
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
        fontSize: 24,
        fontWeight: 'bold',
        color: COLORS.TEXT_ON_LIGHT, 
    },
    
    // ABAS
    tabsContainer: {
        flexDirection: 'row',
        backgroundColor: COLORS.WHITE,
        borderRadius: 12,
        padding: 4,
        marginBottom: 15,
        elevation: 2,
    },
    tabButton: {
        flex: 1,
        paddingVertical: 10,
        alignItems: 'center',
        borderRadius: 8,
    },
    tabActive: {
        backgroundColor: COLORS.CARD_BG,
    },
    tabText: {
        fontSize: 11,
        fontWeight: 'bold',
        color: COLORS.TEXT_ON_LIGHT,
        textAlign: 'center',
    },
    tabTextActive: {
        color: COLORS.WHITE,
    },

    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.CARD_BG, 
        borderRadius: 12,
        marginBottom: 15,
        height: 50,
        elevation: 3,
    },
    searchInput: {
        flex: 1,
        height: 50,
        paddingHorizontal: 10,
        fontSize: 16,
        color: COLORS.WHITE,
    },
    listContent: {
        paddingBottom: 20,
    },

  
    card: {
        backgroundColor: COLORS.CARD_BG,
        borderRadius: 16,
        padding: 16,
        marginBottom: 15,
        elevation: 4,
        shadowColor: '#000',
        shadowOpacity: 0.3,
        shadowRadius: 4,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.WHITE,
    },
    cardSubtitle: {
        fontSize: 14,
        color: COLORS.ACCENT_PRIMARY,
        fontWeight: '600',
        marginTop: 2,
    },
    contactRow: {
        flexDirection: 'row',
        gap: 8,
    },
    iconBtn: {
        width: 32,
        height: 32,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    cardBody: {
        marginBottom: 12,
    },
    serviceText: {
        fontSize: 15,
        color: COLORS.TEXT_SUBTLE_ON_DARK,
        marginBottom: 6,
    },
    dateRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    dateText: {
        color: COLORS.TEXT_SUBTLE_ON_DARK,
        fontSize: 13,
    },
    statusRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15,
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 20,
        borderWidth: 1,
        backgroundColor: 'rgba(0,0,0,0.2)',
    },
    statusText: {
        fontSize: 12,
        fontWeight: 'bold',
        textTransform: 'uppercase',
    },
   
    checkBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.SUCCESS,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        gap: 6,
    },
   
    startBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.ACCENT_PRIMARY,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        gap: 6,
    },
    checkBtnText: {
        color: COLORS.WHITE,
        fontWeight: 'bold',
        fontSize: 12,
    },
    cardFooter: {
        flexDirection: 'row',
        borderTopWidth: 1,
        borderTopColor: COLORS.DARK_SUBTLE,
        paddingTop: 12,
        justifyContent: 'space-around',
    },
    footerBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        padding: 5,
    },
    footerBtnText: {
        color: COLORS.TEXT_SUBTLE_ON_DARK,
        fontSize: 14,
        fontWeight: '600',
    },
    dividerVertical: {
        width: 1,
        height: 20,
        backgroundColor: COLORS.DARK_SUBTLE,
    },

    emptyText: {
        textAlign: 'center',
        marginTop: 20,
        fontSize: 16,
        color: COLORS.TEXT_ON_LIGHT, 
    },
    
    
    botoesContainer: {
        gap: 12, 
        marginTop: 5,
        marginBottom: 20,
    },
    primaryActionsRow: {
        flexDirection: 'row',
        justifyContent: 'center',
    },
    halfWidth: {
        flex: 1, 
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
    },
    textoBotao: {
        color: COLORS.WHITE,
        fontWeight: '700',
        fontSize: 16,
    },
});