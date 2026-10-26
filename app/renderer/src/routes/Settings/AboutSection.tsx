import React, { useContext, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { DISCORD_LINK, RELEASE_NOTES_LINK } from "@pomatez/shareables";
import { ConnnectorContext } from "contexts";
import { StyledAboutCard } from "styles";

import Json from "../../../package.json";
import SettingSection from "./SettingSection";

const AboutSection: React.FC = () => {
  const { t } = useTranslation();
  const { openExternalCallback } = useContext(ConnnectorContext);

  // Routes target="_blank" links through the OS browser.
  useEffect(() => {
    if (openExternalCallback) {
      openExternalCallback();
    }
  }, [openExternalCallback]);

  const links = [
    { label: t("settings.aboutReleaseNotes"), href: RELEASE_NOTES_LINK },
    {
      label: t("settings.aboutDocs"),
      href: "https://zidoro.github.io/pomatez/",
    },
    {
      label: t("settings.aboutReportIssue"),
      href: "https://github.com/zidoro/pomatez/issues",
    },
    {
      label: t("settings.aboutGithub"),
      href: "https://github.com/zidoro/pomatez",
    },
    { label: t("settings.aboutDiscord"), href: DISCORD_LINK },
  ];

  const name = `Pomatez v${Json.version}`;

  return (
    <SettingSection
      id="settings-about"
      heading={t("settings.groupAbout")}
      searchText={[name, ...links.map((link) => link.label)]}
      padded
    >
      <StyledAboutCard>
        <span className="version">
          {name} · {t("settings.aboutTagline")}
        </span>
        <nav className="links" aria-label={t("settings.groupAbout")}>
          {links.map(({ label, href }, index) => (
            <React.Fragment key={href}>
              {index > 0 && <span aria-hidden>·</span>}
              <a href={href} target="_blank" rel="noopener noreferrer">
                {label}
              </a>
            </React.Fragment>
          ))}
        </nav>
      </StyledAboutCard>
    </SettingSection>
  );
};

export default AboutSection;
