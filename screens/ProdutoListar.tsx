import React, { useState, useEffect } from 'react';
import { FlatList, Image, KeyboardAvoidingView, SafeAreaView, SafeAreaViewComponent, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import estilo from "../estilo";
import { auth, firestore } from '../firebase';
import { useNavigation } from '@react-navigation/native';
import { Produto } from '../model/Fornecedor';

export default function ProdutoListar () {
    const navigation = useNavigation();
    const [produto, setProduto] = useState<Produto[]>([]);   
    const [loading, setLoading] = useState(true);

    const refProduto = firestore.collection("Usuario")
        .doc(auth.currentUser?.uid)
        .collection("Produto").orderBy("descricao", "asc");

    const delProduto = firestore.collection("Usuario")
        .doc(auth.currentUser?.uid)
        .collection("Produto");      

    useEffect ( () => {
        if (loading){
            listarProdutos();
        }
        
    }, [produto] )

    const listarProdutos = () => {
        const lerColletion = refProduto
            .onSnapshot((querySnapshot) => {
                const produto = [];
                querySnapshot.forEach((documentSnapshot) => {
                    produto.push({
                        ...documentSnapshot.data(),
                        key: documentSnapshot.id
                    });
                });
                setProduto(produto);
                console.log(produto);
                setLoading(false);
            });
            return () => lerColletion();
    }


    const excluir = async(item) => {
        const resultado = await delProduto
            .doc(item.id)
            .delete()
            .then( () => {
                setLoading(true);
                alert("Produto excluído!");                
            })
    }

    const editar = (item: Produto) => {
        navigation.navigate("Cadastrar Produto", {produto: item});
    }

    const criaItem = ({item}) => (
        <TouchableOpacity 
            style={estilo.item} 
            onPress={() => editar(item)}
            onLongPress={() => excluir(item)}
        >            
            <Image 
                source={{ uri: item.foto}} 
                style={estilo.fotoListar} 
            />
            <View style={estilo.detalhes}>
                <Text style={estilo.titulo}>Descrição: {item.descricao} </Text>
                <Text style={estilo.titulo}>Preço: {Number(item.preco).toFixed(2)} </Text>
                <Text style={estilo.titulo}>Estoque: {item.estoque} </Text>
                <Text style={estilo.titulo}>Invest: {Number(item.estoque * item.preco).toFixed(2)}</Text>
            </View>
        </TouchableOpacity>
    )


    return(
        <SafeAreaView style={estilo.container}>
            <FlatList
                data={produto}
                renderItem={criaItem}
                keyExtractor={(item) => item.id}
                refreshing={loading}
                onRefresh={() => listarProdutos() }
            />
        </SafeAreaView>
    )
}
