import React, { useEffect, useState } from 'react';
import { 
    Alert, 
    KeyboardAvoidingView, 
    StyleSheet, 
    Text, 
    TextInput, 
    TouchableOpacity, 
    View, 
    ScrollView, 
    Platform,
    ActivityIndicator
} from 'react-native';
import { firestore as db } from '../firebase';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';


const COLORS = {
    BACKGROUND: '#f0f2f5', 
    DARK_CARD: '#2c3e50', 
    ACCENT_PRIMARY: '#1e88e5', 
    DARK_SUBTLE: '#34495e', 
    DANGER: '#dc3545', 
    WARNING: '#ffc107', 
    SUCCESS: '#28a745', 
    TEXT_LIGHT: '#ecf0f1',
    TEXT_DARK: '#2c3e50',
    TEXT_SUBTLE: '#95a5a6',
    WHITE: '#fff',
};


const THEME = {
    bg: COLORS.BACKGROUND,
    card: COLORS.DARK_CARD,       
    input: COLORS.DARK_SUBTLE,    
    text: COLORS.TEXT_LIGHT,      
    text_subtle: COLORS.TEXT_SUBTLE,
    accent: COLORS.ACCENT_PRIMARY,
    danger: COLORS.DANGER,
    warning: COLORS.WARNING,
    success: COLORS.SUCCESS,
    icon_color: COLORS.TEXT_SUBTLE 
};

const formatarData = (dateOrTimestamp: any): string => {
    let dataObj: Date;
    if (!dateOrTimestamp) return 'Selecione uma data';

    if (dateOrTimestamp.toDate) { 
        dataObj = dateOrTimestamp.toDate();
    } else { 
        dataObj = dateOrTimestamp;
    }
 
    try {
        const dia = dataObj.getDate().toString().padStart(2, '0');
        const mes = (dataObj.getMonth() + 1).toString().padStart(2, '0');
        const ano = dataObj.getFullYear();
        return `${dia}/${mes}/${ano}`;
    } catch (e) {
        return 'Data inválida';
    }
};

type ManutencaoManterRouteParams = {
    item?: {
        id: string;
        cliente: string;
        telefone: string;
        veiculo: string;
        servico: string;
        status: 'Agendado' | 'Em Andamento' | 'Concluído';
        data: any; 
    };
};
type ManutencaoManterRouteProp = RouteProp<{ params: ManutencaoManterRouteParams }, 'params'>;
type StatusManutencao = 'Agendado' | 'Em Andamento' | 'Concluído';

export default function ManutencaoManter() {
    const navigation = useNavigation();
    const route = useRoute<ManutencaoManterRouteProp>();
    const itemParaEditar = route.params?.item;

    const [cliente, setCliente] = useState<string>('');
    const [telefone, setTelefone] = useState<string>('');
    const [veiculo, setVeiculo] = useState<string>('');
    const [servico, setServico] = useState<string>('');
    const [status, setStatus] = useState<StatusManutencao>('Agendado');
    const [data, setData] = useState<Date>(new Date()); 
    const [showPicker, setShowPicker] = useState<boolean>(false);
    const [isSaving, setIsSaving] = useState<boolean>(false);
    
    const refManutencoes = db.collection("manutencoes");

    useEffect(() => {
        if (itemParaEditar) {
            setCliente(itemParaEditar.cliente);
            setTelefone(itemParaEditar.telefone || '');
            setVeiculo(itemParaEditar.veiculo);
            setServico(itemParaEditar.servico);
            setStatus(itemParaEditar.status);
            setData(itemParaEditar.data && itemParaEditar.data.toDate ? itemParaEditar.data.toDate() : new Date()); 
        }
    }, [itemParaEditar]);

    const salvar = async () => {
        if (!cliente || !veiculo || !servico || !telefone) {
            Alert.alert("Campos Obrigatórios", "Por favor, preencha todas as informações.");
            return;
        }

        setIsSaving(true);
        
        const dadosManutencao = {
            cliente: cliente.trim(),
            telefone: telefone.trim(),
            veiculo: veiculo.trim(),
            servico: servico.trim(),
            status: status,
            data: data, 
        };

        try {
            if (itemParaEditar) {
                await refManutencoes.doc(itemParaEditar.id).update(dadosManutencao);
                Alert.alert("Sucesso", "Serviço atualizado!");
            } else {
                await refManutencoes.add(dadosManutencao);
                Alert.alert("Sucesso", "Serviço agendado!");
            }
            Limpar();
            navigation.goBack();
        } catch (error) {
            console.error("Erro ao salvar:", error);
            Alert.alert("Erro", "Falha ao salvar. Verifique sua conexão.");
        } finally {
            setIsSaving(false);
        }
    }

    const Limpar = () => {
        setCliente('');
        setTelefone('');
        setVeiculo('');
        setServico('');
        setStatus('Agendado');
        setData(new Date()); 
    }

    const onDateChange = (event: any, selectedDate?: Date) => {
        setShowPicker(false);
        if (selectedDate) setData(selectedDate);
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
            <ScrollView 
                contentContainerStyle={styles.scrollContainer}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
            >
               
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                         <MaterialCommunityIcons name="arrow-left" size={24} color={COLORS.TEXT_DARK} />
                    </TouchableOpacity>
                    <Text style={styles.tituloHeader}>
                        {itemParaEditar ? 'Editar Serviço' : 'Novo Agendamento'}
                    </Text>
                    <View style={{width: 40}} /> 
                </View>

                
                <View style={styles.formCard}>
                    
                    <Text style={styles.sectionTitle}>Dados do Cliente</Text>
                    
                    <View style={styles.inputContainer}>
                        <MaterialCommunityIcons name="account" size={20} color={THEME.icon_color} style={styles.inputIcon} />
                        <TextInput
                            placeholder='Nome do Cliente'
                            placeholderTextColor={THEME.text_subtle}
                            style={styles.input}
                            value={cliente}
                            onChangeText={setCliente}
                        />
                    </View>

                    <View style={styles.inputContainer}>
                        <MaterialCommunityIcons name="phone" size={20} color={THEME.icon_color} style={styles.inputIcon} />
                        <TextInput
                            placeholder='Telefone / WhatsApp'
                            placeholderTextColor={THEME.text_subtle}
                            style={styles.input}
                            value={telefone}
                            onChangeText={setTelefone}
                            keyboardType="phone-pad"
                        />
                    </View>

                    <Text style={[styles.sectionTitle, { marginTop: 15 }]}>Veículo e Serviço</Text>

                    <View style={styles.inputContainer}>
                        <MaterialCommunityIcons name="car" size={20} color={THEME.icon_color} style={styles.inputIcon} />
                        <TextInput
                            placeholder='Veículo (Ex: Fiat Uno - ABC-1234)'
                            placeholderTextColor={THEME.text_subtle}
                            style={styles.input}
                            value={veiculo}
                            onChangeText={setVeiculo}
                        />
                    </View>

                    <View style={[styles.inputContainer, { alignItems: 'flex-start', paddingTop: 12 }]}>
                        <MaterialCommunityIcons name="wrench" size={20} color={THEME.icon_color} style={styles.inputIcon} />
                        <TextInput
                            placeholder='Descrição do Serviço'
                            placeholderTextColor={THEME.text_subtle}
                            style={[styles.input, { minHeight: 80 }]}
                            value={servico}
                            onChangeText={setServico}
                            multiline
                            numberOfLines={3}
                        />
                    </View>

                    <Text style={[styles.sectionTitle, { marginTop: 15 }]}>Agendamento</Text>

                    <TouchableOpacity 
                        style={styles.dateButton} 
                        onPress={() => setShowPicker(true)}
                        activeOpacity={0.7}
                    >
                        <View style={{flexDirection: 'row', alignItems: 'center'}}>
                            <MaterialCommunityIcons name="calendar-month" size={22} color={THEME.accent} />
                            <Text style={styles.dateLabel}>Data Prevista</Text>
                        </View>
                        <Text style={styles.dateValue}>{formatarData(data)}</Text>
                    </TouchableOpacity>

                    {showPicker && (
                        <DateTimePicker
                            value={data}
                            mode={'date'}
                            display="default"
                            onChange={onDateChange}
                        />
                    )}

                    <Text style={[styles.sectionTitle, { marginTop: 15 }]}>Status Atual</Text>
                    <View style={styles.statusContainer}>
                        {['Agendado', 'Em Andamento', 'Concluído'].map((statusOption) => {
                            const isSelected = status === statusOption;
                            let activeColor = THEME.accent;
                            if (statusOption === 'Em Andamento') activeColor = THEME.warning;
                            if (statusOption === 'Concluído') activeColor = THEME.success;

                            return (
                                <TouchableOpacity
                                    key={statusOption}
                                    style={[
                                        styles.statusChip, 
                                        isSelected ? { backgroundColor: activeColor, borderColor: activeColor } : { borderColor: THEME.input }
                                    ]}
                                    onPress={() => setStatus(statusOption as StatusManutencao)}
                                >
                                    <Text style={[
                                        styles.statusText, 
                                        isSelected ? { color: COLORS.WHITE, fontWeight: 'bold' } : { color: THEME.text_subtle }
                                    ]}>
                                        {statusOption}
                                    </Text>
                                </TouchableOpacity>
                            )
                        })}
                    </View>

                    <View style={styles.actionButtons}>
                        <TouchableOpacity 
                            style={styles.btnSalvar} 
                            onPress={salvar}
                            disabled={isSaving}
                        >
                            {isSaving ? <ActivityIndicator color="#fff" /> : (
                                <>
                                    <MaterialCommunityIcons name="check" size={22} color="#fff" style={{marginRight: 8}}/>
                                    <Text style={styles.btnSalvarText}>Salvar Serviço</Text>
                                </>
                            )}
                        </TouchableOpacity>

                        {!itemParaEditar && (
                             <TouchableOpacity onPress={Limpar} style={styles.btnLimpar}>
                                <Text style={styles.btnLimparText}>Limpar Campos</Text>
                            </TouchableOpacity>
                        )}
                    </View>

                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: THEME.bg,
    },
    scrollContainer: {
        flexGrow: 1,
        padding: 20,
        paddingTop: 60,
        paddingBottom: 40,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    backButton: {
        padding: 8,
        borderRadius: 8,
        
    },
    tituloHeader: {
        fontSize: 22,
        fontWeight: '900',
        color: COLORS.TEXT_DARK, 
    },
    
    
    formCard: {
        backgroundColor: THEME.card,
        borderRadius: 20,
        padding: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 8,
    },
    sectionTitle: {
        fontSize: 12,
        fontWeight: 'bold',
        color: THEME.text, 
        textTransform: 'uppercase',
        marginBottom: 10,
        letterSpacing: 1,
        opacity: 0.8,
    },
    
   
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: THEME.input, 
        borderRadius: 12,
        marginBottom: 12,
        paddingHorizontal: 15,
        borderWidth: 1,
        borderColor: 'transparent', 
    },
    inputIcon: {
        marginRight: 10,
    },
    input: {
        flex: 1,
        color: THEME.text, 
        paddingVertical: 14,
        fontSize: 16,
    },

   
    dateButton: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: THEME.input,
        padding: 16,
        borderRadius: 12,
        marginBottom: 10,
    },
    dateLabel: {
        color: THEME.text,
        marginLeft: 10,
        fontSize: 15,
        fontWeight: '500',
    },
    dateValue: {
        color: THEME.accent,
        fontWeight: 'bold',
        fontSize: 16,
    },

    
    statusContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 25,
    },
    statusChip: {
        flex: 1,
        paddingVertical: 12,
        alignItems: 'center',
        borderRadius: 25,
        borderWidth: 1,
        borderColor: THEME.input, 
        backgroundColor: THEME.input, 
    },
    statusText: {
        fontSize: 12,
        fontWeight: '600',
    },

   
    actionButtons: {
        marginTop: 10,
        gap: 15,
    },
    btnSalvar: {
        backgroundColor: THEME.accent,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 16,
        borderRadius: 12,
        shadowColor: THEME.accent,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 5,
        elevation: 6,
    },
    btnSalvarText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    btnLimpar: {
        alignItems: 'center',
        padding: 10,
    },
    btnLimparText: {
        color: THEME.text_subtle,
        textDecorationLine: 'underline',
    },
});