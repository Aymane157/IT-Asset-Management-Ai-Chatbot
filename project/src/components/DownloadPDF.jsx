import React from "react";
import { PDFDownloadLink } from "@react-pdf/renderer";
import DechargePDF from "../components/Decharge.jsx";

const MyApp = (prop) => {
 const today = new Date();
  /*const items = [
  {
    label: "Ordinateur Portable",
    sn: "ABC12345",
    inventory: "INV98765",
  },
  {
    label: "Ordinateur Portable",
    sn: "ABC12345",
    inventory: "INV98765",
  }
];*/
  const data = {
    name: prop.name,
    items:prop.items,
    date: prop.date || today.toLocaleDateString("fr-FR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }),
  
  };

  return (
    <div>
      <PDFDownloadLink
        document={<DechargePDF {...data} />}
        fileName="decharge.pdf"
        className="text-[#29ABF1] hover:text-black"
      >
        {({ loading }) =>
          loading ? "Génération en cours..." : "Télécharger la décharge PDF"
        }
      </PDFDownloadLink>
    </div>
  );
};

export default MyApp;
