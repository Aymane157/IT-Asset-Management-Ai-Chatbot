import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
  Image
} from "@react-pdf/renderer";
import logo from "../assets/ADD.jpg"
// Optional: register a font for nicer look
// Font.register({
//   family: "Helvetica",
//   src: "https://fonts.gstatic.com/s/helvetica/v11/helvetica.ttf",
// });

const styles = StyleSheet.create({
  page: {
    display:"flex",
    padding: 40,
    fontSize: 12,
    fontFamily: "Helvetica",
  },
  title: {
    fontSize: 18,
    textAlign: "center",
    marginBottom: 20,
  },
  paragraph: {
    marginBottom: 12,
    lineHeight: 1.4,
  },
  listItem: {
    marginLeft: 20,
    marginBottom: 8,
  },
  signatureLine: {
    marginTop: 60,
    borderTopWidth: 1,
    borderTopColor: "#000",
    width: 200,
    textAlign: "center",
    alignSelf: "flex-start",
    paddingTop: 6,
  },
  date: {
    marginTop: 30,
  },
  logo: {
    width: 150,
    height: 100,
    marginBottom: 20,
    alignSelf: "center",
  },
});

const DechargePDF = ({
  name = "M./Mme. …..",
  items=[],
  date="01/01/2023"
}) => (
  <Document>
    <Page style={styles.page}>
     {<Image style={styles.logo} src={logo} />}
      <Text style={styles.title}>Décharge</Text>

      <Text style={styles.paragraph}>
        Je soussigné (e) : <Text>{name}</Text>, certifie avoir reçu le matériel informatique suivant :
      </Text>

      {items.map((item, index) => (
        <View key={index} style={styles.listItem}>
          <Text>
  • {item.label}{" "}
  {item.sn ? `SN : ${item.sn}, ` : ""}
  {item.inventory ? `numéro d’inventaire : ${item.inventory} ;` : ""}
  {!item.sn && !item.inventory ? item.description : ""}
  
</Text>
        </View>
        
      ))}

<Text style={styles.date}>Le : {date}</Text>
      <Text style={styles.signatureLine}>Signature</Text>
    </Page>
  </Document>
);

export default DechargePDF;
