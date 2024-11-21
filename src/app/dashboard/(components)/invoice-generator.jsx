import React from "react";
import {
  PDFDownloadLink,
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from "@react-pdf/renderer";
import { Button } from "@/components/ui/button";
import { FileDown } from "lucide-react";

// Define styles for PDF
const styles = StyleSheet.create({
  page: { padding: 30 },
  header: { fontSize: 18, marginBottom: 20, textAlign: "center" },
  table: { display: "table", width: "auto", marginBottom: 10 },
  tableRow: { flexDirection: "row" },
  tableCol: { width: "25%", borderStyle: "solid", borderWidth: 1, padding: 5 },
  tableCell: { margin: "auto", fontSize: 10 },
  total: { fontSize: 12, fontWeight: "bold", marginTop: 10 },
});

// PDF Document component
const InvoicePDF = ({ transaction }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <Text style={styles.header}>
        {transaction.type.toUpperCase()} INVOICE
      </Text>
      <Text>Invoice Number: {transaction.invoiceNumber}</Text>
      <Text>Date: {new Date(transaction.date).toLocaleDateString()}</Text>
      <Text>Party Name: {transaction.partyName}</Text>
      <View style={styles.table}>
        <View style={styles.tableRow}>
          <View style={styles.tableCol}>
            <Text style={styles.tableCell}>Product</Text>
          </View>
          <View style={styles.tableCol}>
            <Text style={styles.tableCell}>Quantity</Text>
          </View>
          <View style={styles.tableCol}>
            <Text style={styles.tableCell}>Rate</Text>
          </View>
          <View style={styles.tableCol}>
            <Text style={styles.tableCell}>Amount</Text>
          </View>
        </View>
        {transaction.products.map((item, index) => (
          <View style={styles.tableRow} key={index}>
            <View style={styles.tableCol}>
              <Text style={styles.tableCell}>{item.product.name}</Text>
            </View>
            <View style={styles.tableCol}>
              <Text style={styles.tableCell}>{item.quantity}</Text>
            </View>
            <View style={styles.tableCol}>
              <Text style={styles.tableCell}>{item.rate.toFixed(2)}</Text>
            </View>
            <View style={styles.tableCol}>
              <Text style={styles.tableCell}>{item.amount.toFixed(2)}</Text>
            </View>
          </View>
        ))}
      </View>
      <Text style={styles.total}>
        Total Amount: {transaction.totalAmount.toFixed(2)}
      </Text>
    </Page>
  </Document>
);

// Invoice Generator component
export const InvoiceGenerator = ({ transaction }) => {
  return (
    <PDFDownloadLink
      document={<InvoicePDF transaction={transaction} />}
      fileName={`${transaction.type}_${transaction.invoiceNumber}.pdf`}
    >
      {({ blob, url, loading, error }) => (
        <Button disabled={loading} size="sm" variant="outline">
          {loading ? (
            "Generating..."
          ) : (
            <>
              <FileDown className="mr-2 h-4 w-4" />
              Download PDF
            </>
          )}
        </Button>
      )}
    </PDFDownloadLink>
  );
};
