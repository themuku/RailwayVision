// src/components/LanguageSwitcher.tsx
import { NativeSelect, Box } from "@mantine/core";
import { useTranslation } from "react-i18next";

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();

  const languages = [
    { value: "en", label: "English" },
    { value: "ru", label: "Русский" },
    { value: "az", label: "Azərbaycan" },
  ];

  return (
    <Box style={{ width: 130, flexShrink: 0 }}>
      <NativeSelect
        size="xs"
        value={i18n.language}
        onChange={(event) => i18n.changeLanguage(event.currentTarget.value)}
        data={languages}
      />
    </Box>
  );
};

export default LanguageSwitcher;
