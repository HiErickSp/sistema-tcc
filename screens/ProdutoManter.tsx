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
    icon_color: COLORS.TEXT_SUBTLE
};

type ProdutoManterRouteParams = {
    item?: {
        id: string;
        nome: string;
        codigo: string;
        qtd: number;
    };
};
type ProdutoManterRouteProp = RouteProp<{ params: ProdutoManterRouteParams }, 'params'>;

export default function ProdutoManter() {
    const navigation = useNavigation();
    const route = useRoute<ProdutoManterRouteProp>();
    const itemParaEditar = route.params?.item;

    const [nome, setNome] = useState('');
    const [codigo, setCodigo] = useState('');
    const [qtd, setQtd] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    
    const refPecas = db.collection("pecas");

    useEffect(() => {
        if (itemParaEditar) {
            setNome(itemParaEditar.nome);
            setCodigo(itemParaEditar.codigo);
            setQtd(itemParaEditar.qtd.toString());
        }
    }, [itemParaEditar]);

    const gerarCodigoCurto = () => {
        const codigoAleatorio = Math.random().toString(36).substring(2, 8).toUpperCase();
        return `INT-${codigoAleatorio}`;
    }

    const salvar = async () => {
        if (!nome || !qtd) {
            Alert.alert("Atenção", "Os campos 'Nome da Peça' e 'Quantidade' são obrigatórios.");
            return;
        }

        const quantidadeNum = parseInt(qtd);
        if (isNaN(quantidadeNum)) {
            Alert.alert("Atenção", "A quantidade deve ser um número.");
            return;
        }

        setIsSaving(true);

        let codigoFinal = codigo;

        if (!itemParaEditar && !codigoFinal) {
            codigoFinal = gerarCodigoCurto();
        }

        if (itemParaEditar && !codigoFinal) {
             Alert.alert("Atenção", "Não é possível deixar uma peça existente sem código.");
             setIsSaving(false);
            return;
        }

        const dadosDaPeca = {
            nome: nome.trim(),
            codigo: codigoFinal.trim(),
            qtd: quantidadeNum
        };

        try {
            if (itemParaEditar) {
                await refPecas.doc(itemParaEditar.id).update(dadosDaPeca);
                Alert.alert("Sucesso", "Peça atualizada!");
            } else {
                await refPecas.add(dadosDaPeca);
                Alert.alert("Sucesso", "Peça adicionada!");
            }
            Limpar();
            navigation.goBack();
        } catch (error) {
            Alert.alert("Erro", "Não foi possível salvar a peça.");
            console.error(error);
        } finally {
            setIsSaving(false);
        }
    }

    const Limpar = () => {
        setNome('');
        setCodigo('');
        setQtd('');
    }

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
                        {itemParaEditar ? 'Editar Peça' : 'Nova Peça'}
                    </Text>
                    <View style={{width: 40}} /> 
                </View>

            
                <View style={styles.formCard}>
                    
                    <Text style={styles.sectionTitle}>Informações da Peça</Text>

                    <View style={styles.inputContainer}>
                        <MaterialCommunityIcons name="package-variant" size={20} color={THEME.icon_color} style={styles.inputIcon} />
                        <TextInput
                            placeholder='Nome da Peça (Ex: Óleo 5W30)'
                            placeholderTextColor={THEME.text_subtle}
                            style={styles.input}
                            value={nome}
                            onChangeText={setNome}
                        />
                    </View>

                    <View style={styles.inputContainer}>
                        <MaterialCommunityIcons name="barcode" size={20} color={THEME.icon_color} style={styles.inputIcon} />
                        <TextInput
                            placeholder={itemParaEditar ? 'Código' : 'Código (Deixe vazio p/ gerar auto)'}
                            placeholderTextColor={THEME.text_subtle}
                            style={styles.input}
                            value={codigo}
                            onChangeText={setCodigo}
                            editable={true} 
                        />
                    </View>

                    <View style={styles.inputContainer}>
                        <MaterialCommunityIcons name="numeric" size={20} color={THEME.icon_color} style={styles.inputIcon} />
                        <TextInput
                            placeholder='Quantidade em Estoque'
                            placeholderTextColor={THEME.text_subtle}
                            style={styles.input}
                            value={qtd}
                            onChangeText={setQtd}
                            keyboardType='numeric'
                        />
                    </View>

                  
                    <View style={styles.actionButtons}>
                        <TouchableOpacity 
                            style={styles.btnSalvar} 
                            onPress={salvar}
                            disabled={isSaving}
                        >
                            {isSaving ? <ActivityIndicator color="#fff" /> : (
                                <>
                                    <MaterialCommunityIcons name="content-save" size={22} color="#fff" style={{marginRight: 8}}/>
                                    <Text style={styles.btnSalvarText}>Salvar Estoque</Text>
                                </>
                            )}
                        </TouchableOpacity>

                        <View style={{flexDirection: 'row', justifyContent: 'space-between', marginTop: 10}}>
                            <TouchableOpacity onPress={Limpar} style={styles.btnSecundario}>
                                <Text style={styles.btnSecundarioText}>Limpar</Text>
                            </TouchableOpacity>
                            
                            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.btnSecundario}>
                                <Text style={styles.btnSecundarioText}>Cancelar</Text>
                            </TouchableOpacity>
                        </View>
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
        paddingHorizontal: 24,
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
        marginBottom: 15,
        letterSpacing: 1,
        opacity: 0.8,
    },

    
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: THEME.input, 
        borderRadius: 12,
        marginBottom: 15,
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

    
    actionButtons: {
        marginTop: 20,
        gap: 10,
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
        marginBottom: 5,
    },
    btnSalvarText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    btnSecundario: {
        padding: 10,
        minWidth: 80,
        alignItems: 'center',
    },
    btnSecundarioText: {
        color: THEME.text_subtle,
        fontSize: 14,
        fontWeight: '600',
    },
});