import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ViewStyle,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import Colors from "@/constants/Colors";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

// Definir tipos para las props de navegación
type RootStackParamList = {
  Home: undefined;
  // Agrega otras rutas según sea necesario
};

type NewTransactionScreenNavigationProp =
  NativeStackNavigationProp<RootStackParamList>;

// Definir tipo para los datos del formulario
type FormData = {
  amount: string;
  type: string;
  description: string;
};

// Definir tipo para los errores
type FormErrors = {
  amount: string;
  type: string;
  description: string;
};

// Definir tipo para las opciones de tipo de transacción
type TransactionTypeOption = {
  value: string;
  label: string;
};

export default function NewTransactionScreen() {
  const navigation = useNavigation<NewTransactionScreenNavigationProp>();
  const [formData, setFormData] = useState<FormData>({
    amount: "",
    type: "ingreso",
    description: "",
  });
  const [errors, setErrors] = useState<FormErrors>({
    amount: "",
    type: "",
    description: "",
  });
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Tipos de transacción disponibles con tipo definido
  const transactionTypes: TransactionTypeOption[] = [
    { value: "ingreso", label: "Ingreso" },
    { value: "gasto", label: "Gasto" },
    { value: "transferencia", label: "Transferencia" },
  ];

  // Manejar cambios en los inputs con tipos definidos
  const handleChange = (name: keyof FormData, value: string) => {
    setFormData({
      ...formData,
      [name]: value,
    });

    // Limpiar errores al escribir
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: "",
      });
    }
  };

  // Validar el formulario
  const validateForm = (): boolean => {
    let valid = true;
    const newErrors: FormErrors = { ...errors };

    // Validar cantidad
    if (!formData.amount.trim()) {
      newErrors.amount = "La cantidad es requerida";
      valid = false;
    } else if (isNaN(Number(formData.amount))) {
      newErrors.amount = "Debe ser un número válido";
      valid = false;
    } else if (Number(formData.amount) <= 0) {
      newErrors.amount = "La cantidad debe ser mayor a 0";
      valid = false;
    }

    // Validar descripción
    if (!formData.description.trim()) {
      newErrors.description = "La descripción es requerida";
      valid = false;
    } else if (formData.description.length > 100) {
      newErrors.description = "Máximo 100 caracteres";
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  // Enviar la transacción al backend
  const submitTransaction = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);

    const transactionToSend = {
      amount: parseFloat(formData.amount),
      type: formData.type,
      description: formData.description,
    };

    try {
      const response = await fetch("http://localhost:8000/transaction", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(transactionToSend),
      });

      if (response.ok) {
        Alert.alert("Éxito", "Transacción registrada correctamente", [
          {
            text: "OK",
            onPress: () => navigation.goBack(),
          },
        ]);
      } else {
        const errorData = await response.json();
        Alert.alert(
          "Error",
          errorData.message || "Error al registrar transacción"
        );
      }
    } catch (error) {
      Alert.alert("Error", "No se pudo conectar con el servidor");
      console.error("Error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Definir estilo condicional con tipo explícito
  const getInputContainerStyle = (hasError: boolean): ViewStyle => {
    return {
      backgroundColor: "rgba(255, 255, 255, 0.1)",
      borderRadius: 10,
      borderWidth: 1,
      borderColor: hasError ? "#EF4444" : "rgba(255, 255, 255, 0.2)",
      paddingHorizontal: 15,
    };
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardAvoidingView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={styles.backButton}
            >
              <Feather name="arrow-left" size={24} color={Colors.white} />
            </TouchableOpacity>
            <Text style={styles.title}>Nueva Transacción</Text>
          </View>

          <View style={styles.formContainer}>
            {/* Campo: Cantidad */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Cantidad (HNL)</Text>
              <View style={getInputContainerStyle(!!errors.amount)}>
                <TextInput
                  style={styles.input}
                  placeholder="Ej: 1500.50"
                  placeholderTextColor={Colors.gray}
                  keyboardType="decimal-pad"
                  value={formData.amount}
                  onChangeText={(text) => handleChange("amount", text)}
                />
              </View>
              {errors.amount && (
                <Text style={styles.errorText}>{errors.amount}</Text>
              )}
            </View>

            {/* Campo: Tipo de transacción */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Tipo de transacción</Text>
              <View style={styles.radioGroup}>
                {transactionTypes.map((type) => (
                  <TouchableOpacity
                    key={type.value}
                    style={[
                      styles.radioButton,
                      formData.type === type.value && {
                        // Estilos inline para el botón seleccionado
                        backgroundColor: "rgba(59, 130, 246, 0.1)",
                        borderRadius: 8,
                        paddingHorizontal: 8,
                      },
                    ]}
                    onPress={() => handleChange("type", type.value)}
                  >
                    <View style={styles.radioCircle}>
                      {formData.type === type.value && (
                        <View style={styles.radioInnerCircle} />
                      )}
                    </View>
                    <Text
                      style={[
                        styles.radioLabel,
                        formData.type === type.value &&
                          styles.radioLabelSelected,
                      ]}
                    >
                      {type.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Campo: Descripción */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Descripción</Text>
              <View style={getInputContainerStyle(!!errors.description)}>
                <TextInput
                  style={[styles.input, styles.multilineInput]}
                  placeholder="Ej: Ventas de paleta"
                  placeholderTextColor={Colors.gray}
                  multiline
                  numberOfLines={3}
                  maxLength={100}
                  value={formData.description}
                  onChangeText={(text) => handleChange("description", text)}
                />
              </View>
              {errors.description && (
                <Text style={styles.errorText}>{errors.description}</Text>
              )}
              <Text style={styles.charCounter}>
                {formData.description.length}/100 caracteres
              </Text>
            </View>
          </View>

          {/* Botón de enviar */}
          <TouchableOpacity
            style={[
              styles.submitButton,
              isSubmitting && styles.submitButtonDisabled,
            ]}
            onPress={submitTransaction}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <Text style={styles.submitButtonText}>Enviando...</Text>
            ) : (
              <Text style={styles.submitButtonText}>Registrar Transacción</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// Estilos (sin cambios)
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.black,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 30,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.1)",
  },
  backButton: {
    marginRight: 15,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: Colors.white,
    fontFamily: "Poppins, sans-serif",
  },
  formContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 25,
  },
  label: {
    fontSize: 16,
    color: Colors.white,
    marginBottom: 8,
    fontFamily: "Poppins, sans-serif",
  },
  input: {
    color: Colors.white,
    fontSize: 16,
    paddingVertical: 12,
    fontFamily: "Poppins, sans-serif",
  },
  multilineInput: {
    height: 80,
    textAlignVertical: "top",
  },
  errorText: {
    color: "#EF4444",
    fontSize: 14,
    marginTop: 5,
    fontFamily: "Poppins, sans-serif",
  },
  charCounter: {
    color: Colors.gray,
    fontSize: 12,
    textAlign: "right",
    marginTop: 5,
    fontFamily: "Poppins, sans-serif",
  },
  radioGroup: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 5,
  },
  radioButton: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 20,
    marginBottom: 10,
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: Colors.blue,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  radioInnerCircle: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.blue,
  },
  radioLabel: {
    color: Colors.white,
    fontSize: 16,
    fontFamily: "Poppins, sans-serif",
  },
  radioLabelSelected: {
    color: Colors.blue,
    fontWeight: "600",
  },
  submitButton: {
    backgroundColor: Colors.blue,
    marginHorizontal: 20,
    borderRadius: 10,
    paddingVertical: 15,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: "bold",
    fontFamily: "Poppins, sans-serif",
  },
});
