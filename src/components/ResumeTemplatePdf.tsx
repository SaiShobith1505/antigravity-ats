"use client";

import React from "react";
import { 
  Document, 
  Page, 
  Text, 
  View, 
  StyleSheet 
} from "@react-pdf/renderer";
import { ResumeData } from "@/lib/db";

// 1. STYLE SHEET: CLASSIC PROFESSIONAL
const stylesClassic = StyleSheet.create({
  page: {
    padding: 36, // 0.5 inch margins
    fontFamily: "Helvetica",
    fontSize: 9.5,
    lineHeight: 1.35,
    color: "#111111",
    backgroundColor: "#ffffff",
  },
  headerContainer: {
    alignItems: "center",
    marginBottom: 12,
  },
  name: {
    fontFamily: "Helvetica-Bold",
    fontSize: 18,
    color: "#000000",
    marginBottom: 3,
  },
  contactDetails: {
    flexDirection: "row",
    justifyContent: "center",
    flexWrap: "wrap",
    gap: 8,
    fontSize: 8.5,
    color: "#444444",
  },
  sectionTitle: {
    fontFamily: "Helvetica-Bold",
    fontSize: 10.5,
    color: "#000000",
    textTransform: "uppercase",
    borderBottomWidth: 0.75,
    borderBottomColor: "#111111",
    paddingBottom: 2,
    marginTop: 12,
    marginBottom: 6,
  },
  itemHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginBottom: 2,
  },
  itemLeftTitle: {
    fontFamily: "Helvetica-Bold",
    fontSize: 9.5,
    color: "#111111",
  },
  itemRightDetail: {
    fontSize: 8.5,
    color: "#555555",
  },
  itemSubRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 3,
  },
  itemSubLeft: {
    fontFamily: "Helvetica-Oblique",
    fontSize: 9,
    color: "#333333",
  },
  bulletList: {
    marginLeft: 12,
    marginBottom: 4,
  },
  bulletItem: {
    flexDirection: "row",
    marginBottom: 1.5,
  },
  bulletMarker: {
    width: 8,
    fontSize: 9.5,
  },
  bulletText: {
    flex: 1,
    fontSize: 9,
    color: "#222222",
  },
  skillsCategory: {
    flexDirection: "row",
    marginBottom: 3,
  },
  skillsLabel: {
    fontFamily: "Helvetica-Bold",
    width: 90,
  },
  skillsText: {
    flex: 1,
  }
});

// 2. STYLE SHEET: MODERN MINIMAL
const stylesMinimal = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: "Helvetica",
    fontSize: 9.5,
    lineHeight: 1.4,
    color: "#222222",
    backgroundColor: "#ffffff",
  },
  headerContainer: {
    alignItems: "flex-start", // Left-aligned modern balance
    marginBottom: 16,
  },
  name: {
    fontFamily: "Helvetica-Bold",
    fontSize: 20,
    letterSpacing: -0.5,
    color: "#0891b2", // Sleek modern cyan accent
    marginBottom: 4,
  },
  contactDetails: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    fontSize: 8.5,
    color: "#666666",
  },
  sectionTitle: {
    fontFamily: "Helvetica-Bold",
    fontSize: 11,
    color: "#0891b2",
    textTransform: "uppercase",
    paddingBottom: 2,
    marginTop: 14,
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  itemHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginBottom: 1,
  },
  itemLeftTitle: {
    fontFamily: "Helvetica-Bold",
    fontSize: 9.5,
    color: "#111111",
  },
  itemRightDetail: {
    fontSize: 8.5,
    color: "#666666",
  },
  itemSubRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  itemSubLeft: {
    fontFamily: "Helvetica",
    fontSize: 9,
    color: "#444444",
  },
  bulletList: {
    marginLeft: 8,
    marginBottom: 4,
  },
  bulletItem: {
    flexDirection: "row",
    marginBottom: 2,
  },
  bulletMarker: {
    width: 8,
    color: "#0891b2",
  },
  bulletText: {
    flex: 1,
    fontSize: 8.8,
    color: "#333333",
  },
  skillsCategory: {
    flexDirection: "row",
    marginBottom: 4,
  },
  skillsLabel: {
    fontFamily: "Helvetica-Bold",
    color: "#0891b2",
    width: 95,
  },
  skillsText: {
    flex: 1,
  }
});

// 3. STYLE SHEET: PREMIUM TECHNICAL
const stylesTechnical = StyleSheet.create({
  page: {
    padding: 28, // Compact padding to fit detailed engineering items on a single page
    fontFamily: "Helvetica",
    fontSize: 9,
    lineHeight: 1.25,
    color: "#111111",
    backgroundColor: "#ffffff",
  },
  headerContainer: {
    alignItems: "center",
    marginBottom: 8,
  },
  name: {
    fontFamily: "Helvetica-Bold",
    fontSize: 16,
    color: "#000000",
    marginBottom: 2,
  },
  contactDetails: {
    flexDirection: "row",
    justifyContent: "center",
    flexWrap: "wrap",
    gap: 6,
    fontSize: 8,
    color: "#333333",
  },
  sectionTitle: {
    fontFamily: "Helvetica-Bold",
    fontSize: 10,
    color: "#000000",
    textTransform: "uppercase",
    borderBottomWidth: 0.5,
    borderBottomColor: "#333333",
    paddingBottom: 1.5,
    marginTop: 8,
    marginBottom: 4,
  },
  itemHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginBottom: 1,
  },
  itemLeftTitle: {
    fontFamily: "Helvetica-Bold",
    fontSize: 9,
    color: "#000000",
  },
  itemRightDetail: {
    fontSize: 8,
    color: "#444444",
  },
  itemSubRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 2,
  },
  itemSubLeft: {
    fontFamily: "Helvetica-Bold", // Bold roles
    fontSize: 8.5,
    color: "#222222",
  },
  bulletList: {
    marginLeft: 10,
    marginBottom: 3,
  },
  bulletItem: {
    flexDirection: "row",
    marginBottom: 1.5,
  },
  bulletMarker: {
    width: 6,
    fontSize: 8.5,
  },
  bulletText: {
    flex: 1,
    fontSize: 8.5, // High content density bullet points
    color: "#222222",
  },
  skillsCategory: {
    flexDirection: "row",
    marginBottom: 2,
  },
  skillsLabel: {
    fontFamily: "Helvetica-Bold",
    width: 100,
  },
  skillsText: {
    flex: 1,
  }
});

interface ResumeTemplatePdfProps {
  data: ResumeData;
  template?: "classic" | "minimal" | "technical";
}

export const ResumeTemplatePdf: React.FC<ResumeTemplatePdfProps> = ({ data, template = "classic" }) => {
  const { personal, education, experience, projects, skills, certifications } = data;

  // Dynamically select styles
  const styles = template === "minimal" 
    ? stylesMinimal 
    : template === "technical" 
    ? stylesTechnical 
    : stylesClassic;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        
        {/* Header Personal Details Block */}
        <View style={styles.headerContainer}>
          <Text style={styles.name}>{personal.fullName || "Your Full Name"}</Text>
          <View style={styles.contactDetails}>
            {personal.phone && <Text>{personal.phone}</Text>}
            {personal.phone && personal.email && <Text>{template === "technical" ? "|" : "•"}</Text>}
            {personal.email && <Text>{personal.email}</Text>}
            {personal.email && personal.linkedin && <Text>{template === "technical" ? "|" : "•"}</Text>}
            {personal.linkedin && <Text>{personal.linkedin}</Text>}
            {personal.linkedin && personal.github && <Text>{template === "technical" ? "|" : "•"}</Text>}
            {personal.github && <Text>{personal.github}</Text>}
          </View>
        </View>

        {/* Education Section */}
        {education && education.length > 0 && (
          <View>
            <Text style={styles.sectionTitle}>Education</Text>
            {education.map((edu, idx) => (
              <View key={idx} style={{ marginBottom: template === "technical" ? 3 : 5 }}>
                <View style={styles.itemHeaderRow}>
                  <Text style={styles.itemLeftTitle}>{edu.institution}</Text>
                  <Text style={styles.itemRightDetail}>{edu.year}</Text>
                </View>
                <View style={styles.itemSubRow}>
                  <Text style={styles.itemSubLeft}>{edu.degree}</Text>
                  <Text style={styles.itemRightDetail}>{edu.gpa}</Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Work Experience Section */}
        {experience && experience.length > 0 && (
          <View>
            <Text style={styles.sectionTitle}>Experience</Text>
            {experience.map((exp, idx) => (
              <View key={idx} style={{ marginBottom: template === "technical" ? 4 : 6 }}>
                <View style={styles.itemHeaderRow}>
                  <Text style={styles.itemLeftTitle}>{exp.company}</Text>
                  <Text style={styles.itemRightDetail}>{exp.duration}</Text>
                </View>
                <View style={styles.itemSubRow}>
                  <Text style={styles.itemSubLeft}>{exp.role}</Text>
                </View>
                
                {/* Bullet lists parsed linearly */}
                <View style={styles.bulletList}>
                  {exp.bullets && exp.bullets.map((bullet, bIdx) => (
                    bullet.trim().length > 0 && (
                      <View key={bIdx} style={styles.bulletItem}>
                        <Text style={styles.bulletMarker}>•</Text>
                        <Text style={styles.bulletText}>{bullet}</Text>
                      </View>
                    )
                  ))}
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Technical Projects Section */}
        {projects && projects.length > 0 && (
          <View>
            <Text style={styles.sectionTitle}>Projects</Text>
            {projects.map((proj, idx) => (
              <View key={idx} style={{ marginBottom: template === "technical" ? 4 : 6 }}>
                <View style={styles.itemHeaderRow}>
                  <Text style={styles.itemLeftTitle}>{proj.title}</Text>
                  {proj.techStack && (
                    <Text style={styles.itemRightDetail}>
                      Tech: {proj.techStack}
                    </Text>
                  )}
                </View>
                
                {/* Description converted to standard ATS single-column bullets */}
                <View style={styles.bulletList}>
                  {proj.description.split("\n").map((line, lIdx) => (
                    line.trim().length > 0 && (
                      <View key={lIdx} style={styles.bulletItem}>
                        <Text style={styles.bulletMarker}>•</Text>
                        <Text style={styles.bulletText}>{line.trim()}</Text>
                      </View>
                    )
                  ))}
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Technical Skills Section */}
        {skills && (
          <View>
            <Text style={styles.sectionTitle}>Technical Skills</Text>
            
            {skills.languages && skills.languages.length > 0 && (
              <View style={styles.skillsCategory}>
                <Text style={styles.skillsLabel}>Languages:</Text>
                <Text style={styles.skillsText}>{skills.languages.join(", ")}</Text>
              </View>
            )}
            
            {skills.frameworks && skills.frameworks.length > 0 && (
              <View style={styles.skillsCategory}>
                <Text style={styles.skillsLabel}>Frameworks:</Text>
                <Text style={styles.skillsText}>{skills.frameworks.join(", ")}</Text>
              </View>
            )}

            {skills.tools && skills.tools.length > 0 && (
              <View style={styles.skillsCategory}>
                <Text style={styles.skillsLabel}>{template === "technical" ? "Developer Tools:" : "Tools:"}</Text>
                <Text style={styles.skillsText}>{skills.tools.join(", ")}</Text>
              </View>
            )}
          </View>
        )}

        {/* Certifications Section */}
        {certifications && certifications.length > 0 && (
          <View style={{ marginTop: template === "technical" ? 3 : 5 }}>
            <Text style={styles.sectionTitle}>Certifications</Text>
            <View style={styles.bulletList}>
              {certifications.map((cert, idx) => (
                cert.trim().length > 0 && (
                  <View key={idx} style={styles.bulletItem}>
                    <Text style={styles.bulletMarker}>•</Text>
                    <Text style={styles.bulletText}>{cert.trim()}</Text>
                  </View>
                )
              ))}
            </View>
          </View>
        )}

      </Page>
    </Document>
  );
};
