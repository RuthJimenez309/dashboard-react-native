import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import React from "react";
import Colors from "@/constants/Colors";
import { Stack } from "expo-router";
import Header from "@/components/Header";
import { PieChart } from "react-native-gifted-charts";
import ExpenseBlock from "@/components/ExpenseBlock";
import ExpenseList from "@/data/expenses.json";
import IncomeBlock from "@/components/IncomeBlock";
import IncomeList from "@/data/income.json";
import SpendingBlock from "@/components/SpendingBlock";
import SpendingList from "@/data/spending.json";
import { useEffect, useState } from "react";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons"; // Importar Feather

type Transaction = {
  id: number;
  amount: number;
  type: string;
  description: string;
};

export default function Page() {
  const router = useRouter();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  // Función para obtener el color según el tipo de transacción
  const getTransactionColor = (type: string): string => {
    switch (type.toLowerCase()) {
      case "ingreso":
        return Colors.tintColor;
      case "gasto":
        return Colors.gray;
      case "transferencia":
        return Colors.blue;
      default:
        return Colors.white;
    }
  };

  // Función para formatear el monto
  const formatAmount = (amount: number): string => {
    return new Intl.NumberFormat("es-HN", {
      style: "currency",
      currency: "HNL",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  useEffect(() => {
    const obtenerTransacciones = async () => {
      try {
        const response = await fetch("http://localhost:8000/transactions");
        const data = await response.json();
        setTransactions(data);
      } catch (error) {
        console.error("Error al obtener transacciones:", error);
      } finally {
        setLoading(false);
      }
    };

    obtenerTransacciones();
  }, []);

  const pieData = [
    {
      value: 47,
      color: Colors.tintColor,
      focused: true,
      text: "47%",
    },
    { value: 40, color: Colors.blue, text: "40%" },
    { value: 16, color: Colors.white, text: "16%" },
    { value: 7, color: Colors.gray, text: "16%" },
  ];

  return (
    <>
      <Stack.Screen
        options={{
          header: () => <Header />,
        }}
      />
      <View style={[styles.container, { paddingTop: 75 }]}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <View
            style={{ flexDirection: "row", justifyContent: "space-between" }}
          >
            <View style={{ gap: 10 }}>
              <Text
                style={{ color: Colors.white, fontSize: 14, fontWeight: 500 }}
              >
                My <Text style={{ fontWeight: 700 }}>Earning</Text>
              </Text>
              <Text
                style={{ color: Colors.white, fontSize: 36, fontWeight: 700 }}
              >
                $7000.<Text style={{ fontSize: 24, fontWeight: 400 }}>77</Text>
              </Text>
            </View>
            <View style={{ paddingVertical: 20, alignItems: "center" }}>
              {/* PieChart comentado */}
            </View>
          </View>

          <ExpenseBlock expenseList={ExpenseList} />
          <IncomeBlock incomeList={IncomeList} />
          <SpendingBlock spendingList={SpendingList} />

          {/* Sección de Transacciones Recientes */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Transacciones Recientes</Text>
              <TouchableOpacity onPress={() => router.push("/transactions")}>
                <Text style={styles.seeAll}>Ver todas</Text>
              </TouchableOpacity>
            </View>

            {loading ? (
              <View style={styles.loadingContainer}>
                <Text style={styles.loadingText}>
                  Cargando transacciones...
                </Text>
              </View>
            ) : transactions.length > 0 ? (
              transactions.slice(0, 3).map((transaction) => (
                <View key={transaction.id} style={styles.transactionCard}>
                  <View style={styles.transactionLeft}>
                    <View
                      style={[
                        styles.transactionIcon,
                        {
                          backgroundColor: `${getTransactionColor(
                            transaction.type
                          )}20`,
                        },
                      ]}
                    >
                      <Feather
                        name={
                          transaction.type === "ingreso"
                            ? "arrow-down-circle"
                            : "arrow-up-circle"
                        }
                        size={20}
                        color={getTransactionColor(transaction.type)}
                      />
                    </View>
                    <View>
                      <Text style={styles.transactionDescription}>
                        {transaction.description}
                      </Text>
                      <Text style={styles.transactionType}>
                        {transaction.type}
                      </Text>
                    </View>
                  </View>
                  <Text
                    style={[
                      styles.transactionAmount,
                      { color: getTransactionColor(transaction.type) },
                    ]}
                  >
                    {formatAmount(transaction.amount)}
                  </Text>
                </View>
              ))
            ) : (
              <Text style={styles.noTransactions}>
                No hay transacciones recientes
              </Text>
            )}
          </View>
        </ScrollView>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.black,
    paddingHorizontal: 20,
  },
  section: {
    marginTop: 20,
    marginBottom: 40,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  sectionTitle: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: "600",
  },
  seeAll: {
    color: Colors.tintColor,
    fontSize: 14,
  },
  transactionCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
  },
  transactionLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  transactionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  transactionDescription: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: "500",
  },
  transactionType: {
    color: Colors.gray,
    fontSize: 12,
    marginTop: 2,
    textTransform: "capitalize",
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: "600",
  },
  loadingContainer: {
    padding: 20,
    alignItems: "center",
  },
  loadingText: {
    color: Colors.white,
  },
  noTransactions: {
    color: Colors.gray,
    textAlign: "center",
    paddingVertical: 20,
  },
});
