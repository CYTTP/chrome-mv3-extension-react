import { useState, useEffect, useCallback } from "react";



const useChromeStorage = (key: string) => {
    const [value, setValue] = useState<any>();

    useEffect(() => {
        (chrome as any).storage.local.get(key, (result: any) => {
            setValue(result[key]);
        });
    }, [key]);

    const setStorage = useCallback((newValue: any) => {
        (chrome as any).storage.local.set({ [key]: newValue });
    }, [key]);

    return [value, setStorage];
};


export {
    useChromeStorage
}