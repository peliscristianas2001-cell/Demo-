
"use client"

import { useState, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

interface SearchableSelectOption {
    value: string;
    label: string;
    keywords?: string[];
}

interface SearchableSelectProps {
    options: SearchableSelectOption[];
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
}

export function SearchableSelect({ options, value, onChange, placeholder }: SearchableSelectProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const selectedOption = useMemo(() => options.find(opt => opt.value === value), [options, value]);

    const filteredOptions = useMemo(() => {
        if (!searchTerm) return options;
        const lowercasedTerm = searchTerm.toLowerCase();
        return options.filter(opt => 
            opt.label.toLowerCase().includes(lowercasedTerm) || 
            (opt.keywords && opt.keywords.some(kw => kw.toLowerCase().includes(lowercasedTerm)))
        );
    }, [options, searchTerm]);

    const handleSelect = (optionValue: string) => {
        onChange(optionValue);
        setSearchTerm('');
        setIsOpen(false);
    };

    return (
        <div className="relative" onBlur={() => setTimeout(() => setIsOpen(false), 150)}>
            <Input
                placeholder={placeholder}
                value={isOpen ? searchTerm : (selectedOption?.label || '')}
                onChange={(e) => setSearchTerm(e.target.value)}
                onFocus={() => setIsOpen(true)}
            />
            {isOpen && (
                <div className="absolute z-10 w-full mt-1 bg-background border border-border rounded-md shadow-lg">
                    <ScrollArea className="max-h-60">
                        {filteredOptions.length > 0 ? (
                            filteredOptions.map(option => (
                                <div
                                    key={option.value}
                                    className={cn(
                                        "px-3 py-2 cursor-pointer hover:bg-accent",
                                        value === option.value && "bg-accent"
                                    )}
                                    onMouseDown={(e) => { // Use onMouseDown to fire before onBlur
                                        e.preventDefault();
                                        handleSelect(option.value);
                                    }}
                                >
                                    <p>{option.label}</p>
                                    {option.keywords && (
                                        <p className="text-xs text-muted-foreground">{option.keywords.join(', ')}</p>
                                    )}
                                </div>
                            ))
                        ) : (
                            <div className="px-3 py-2 text-sm text-muted-foreground">
                                No se encontraron resultados.
                            </div>
                        )}
                    </ScrollArea>
                </div>
            )}
        </div>
    );
}
