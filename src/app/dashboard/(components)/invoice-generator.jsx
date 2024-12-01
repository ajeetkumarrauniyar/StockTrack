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

// Enhanced PDF Styles
const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontFamily: "Helvetica",
    backgroundColor: "#f5f5f5",
  },
  header: {
    fontSize: 22,
    marginBottom: 20,
    textAlign: "center",
    color: "#333",
    borderBottomWidth: 1,
    borderBottomColor: "#888",
    paddingBottom: 10,
    fontWeight: "bold",
  },
  companyInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  companyDetails: {
    fontSize: 10,
    color: "#666",
  },
  invoiceDetails: {
    fontSize: 10,
    textAlign: "right",
    color: "#666",
  },
  table: {
    display: "table",
    width: "100%",
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  tableHeader: {
    backgroundColor: "#f0f0f0",
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  tableCol: {
    width: "25%",
    padding: 5,
    fontSize: 10,
  },
  tableHeaderCell: {
    margin: "auto",
    fontSize: 10,
    fontWeight: "bold",
    color: "#333",
  },
  tableCell: {
    margin: "auto",
    fontSize: 10,
    color: "#666",
  },
  totalSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  total: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#333",
  },
  grandTotal: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#000",
    // textDecoration: "underline",
  },
  footer: {
    position: "absolute",
    bottom: 30,
    left: 30,
    right: 30,
    fontSize: 8,
    color: "#888",
    borderTopWidth: 1,
    borderTopColor: "#ddd",
    paddingTop: 5,
    textAlign: "center",
  },
});

// PDF Document component with enhanced design
const InvoicePDF = ({ transaction }) => {
  // Calculate total quantity
  const totalQuantity = transaction.products.reduce(
    (sum, item) => sum + item.quantity,
    0
  );

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.companyInfo}>
          <View>
            <Text style={styles.companyDetails}>
              <b>Asha Enterprises</b>
            </Text>
            <Text style={styles.companyDetails}>Pipra, East Champaran</Text>
            <Text style={styles.companyDetails}>Bihar- 845416</Text>
            <Text style={styles.companyDetails}>
              <b>GSTIN:</b>10CABPK9941H1ZV
            </Text>
          </View>
          <View>
            <Text style={styles.invoiceDetails}>
              Invoice Number: {transaction.invoiceNumber}
            </Text>
            <Text style={styles.invoiceDetails}>
              Date: {new Date(transaction.date).toLocaleDateString()}
            </Text>
          </View>
        </View>

        <Text style={styles.header}>
          {transaction.type.toUpperCase()} INVOICE
        </Text>

        <Text style={styles.companyDetails}>
          Bill To: {transaction.partyName}
        </Text>

        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <View style={styles.tableCol}>
              <Text style={styles.tableHeaderCell}>Product</Text>
            </View>
            <View style={styles.tableCol}>
              <Text style={styles.tableHeaderCell}>Quantity</Text>
            </View>
            <View style={styles.tableCol}>
              <Text style={styles.tableHeaderCell}>Rate</Text>
            </View>
            <View style={styles.tableCol}>
              <Text style={styles.tableHeaderCell}>Amount</Text>
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
                <Text style={styles.tableCell}>₹ {item.amount.toFixed(2)}</Text>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.totalSection}>
          <Text style={styles.total}>Total Quantity: {totalQuantity}</Text>
          <Text style={styles.grandTotal}>
            Grand Total: ₹{transaction.totalAmount.toFixed(2)}
          </Text>
        </View>

        <Text style={styles.footer}>
          Thank you for your business! For any questions, please contact us.
        </Text>
      </Page>
    </Document>
  );
};

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
