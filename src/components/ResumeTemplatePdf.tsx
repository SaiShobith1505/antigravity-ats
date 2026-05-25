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

// Strict Recruiter-Approved ATS Styling Tokens
const styles = StyleSheet.create({
  page: {
    padding: 36, // 0.5 inch standard margins
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
    letterSpacing: -0.5,
    color: "#000000",
    marginBottom: 4,
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
    borderBottomWidth: 1,
    borderBottomColor: "#222222",
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
    marginBottom: 6,
  },
  bulletItem: {
    flexDirection: "row",
    marginBottom: 2,
    paddingLeft: 4,
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

interface ResumeTemplatePdfProps {
  data: ResumeData;
}

export const ResumeTemplatePdf: React.FC<ResumeTemplatePdfProps> = ({ data }) => {
  const { personal, education, experience, projects, skills } = data;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        
        {/* Header Personal Details Block */}
        <View style={styles.headerContainer}>
          <Text style={styles.name}>{personal.fullName || "Your Full Name"}</Text>
          <View style={styles.contactDetails}>
            {personal.phone && <Text>{personal.phone}</Text>}
            {personal.phone && personal.email && <Text>•</Text>}
            {personal.email && <Text>{personal.email}</Text>}
            {personal.email && personal.linkedin && <Text>•</Text>}
            {personal.linkedin && <Text>{personal.linkedin}</Text>}
            {personal.linkedin && personal.github && <Text>•</Text>}
            {personal.github && <Text>{personal.github}</Text>}
          </View>
        </View>

        {/* Education Section */}
        {education && education.length > 0 && (
          <View>
            <Text style={styles.sectionTitle}>Education</Text>
            {education.map((edu, idx) => (
              <View key={idx} style={{ marginBottom: 6 }}>
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
              <View key={idx} style={{ marginBottom: 8 }}>
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
              <View key={idx} style={{ marginBottom: 8 }}>
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
                <Text style={styles.skillsLabel}>Developer Tools:</Text>
                <Text style={styles.skillsText}>{skills.tools.join(", ")}</Text>
              </View>
            )}
          </View>
        )}

      </Page>
    </Document>
  );
};
