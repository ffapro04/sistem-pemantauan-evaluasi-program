/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import React, { useEffect, useState } from "react";
import {
    getUiLanguage,
    saveUiLanguage,
    SUPPORTED_UI_LANGUAGES,
} from "../i18n/localUiTranslator";
import { ENABLE_UI_TRANSLATOR } from "../config/features";

function LanguageSwitcher({
    value,
    language,
    onChange,
    setLanguage,
    className = "",
}) {

    if (!ENABLE_UI_TRANSLATOR) return null;

    const controlledLanguage = value || language;
    const [currentLanguage, setCurrentLanguage] = useState(
        controlledLanguage || getUiLanguage(),
    );

    useEffect(() => {
        if (controlledLanguage) {
            setCurrentLanguage(controlledLanguage);
        }
    }, [controlledLanguage]);

    useEffect(() => {
        const handleLanguageChange = (event) => {
            setCurrentLanguage(event?.detail?.language || getUiLanguage());
        };

        window.addEventListener("app-language-change", handleLanguageChange);
        window.addEventListener("ypa-ui-language-change", handleLanguageChange);

        return () => {
            window.removeEventListener("app-language-change", handleLanguageChange);
            window.removeEventListener("ypa-ui-language-change", handleLanguageChange);
        };
    }, []);

    const handleChangeLanguage = (nextLanguage) => {
        let savedLanguage = nextLanguage;

        if (typeof setLanguage === "function") {
            savedLanguage = setLanguage(nextLanguage);
        } else {
            savedLanguage = saveUiLanguage(nextLanguage);
        }

        setCurrentLanguage(savedLanguage);

        if (typeof onChange === "function") {
            onChange(savedLanguage);
        }
    };

    return (
        <div
            className={`inline-flex items-center rounded-full border border-cyan-100 bg-white p-1 shadow-sm ${className}`}
            title="Pilih bahasa"
            data-no-auto-translate="true"
        >
            {SUPPORTED_UI_LANGUAGES.map((item) => {
                const active = currentLanguage === item.code;

                return (
                    <button
                        key={item.code}
                        type="button"
                        onClick={() => handleChangeLanguage(item.code)}
                        className={`h-8 rounded-full px-3 text-[10px] font-black uppercase tracking-[0.16em] transition ${active
                            ? "bg-[#0AC4E0] text-white shadow-md shadow-cyan-100"
                            : "text-slate-400 hover:bg-cyan-50 hover:text-[#0AC4E0]"
                            }`}
                    >
                        {item.label}
                    </button>
                );
            })}
        </div>
    );
}

export default LanguageSwitcher;

