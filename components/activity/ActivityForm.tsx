import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, ChevronDown, Info } from "lucide-react"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { toast } from "react-toastify"
import { addMonths, isBefore } from "date-fns"
import { cn, getCurrentTaipeiTime, isBeforeTaipeiToday, formatTaipeiTime, startOfTaipeiDay } from '@/lib/utils'
import { LOCATIONS, NET_TYPES } from '@/lib/constants'
import { ActivityFormData, ActivityFormProps } from '@/lib/types/activity'
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { useEffect, useCallback } from "react" // Added useCallback

export function ActivityForm({
    formData,
    setFormData,
    isSubmitted,
    setIsSubmitted,
    date,
    setDate,
    time,
    setTime,
    titleRef,
    locationRef,
    amountRef
}: ActivityFormProps) {
    const today = getCurrentTaipeiTime()
    const maxDate = addMonths(today, 2)

    const handleCityChange = (city: string) => {
        setFormData(prev => ({ ...prev, city, district: "" }))
    }

    const handleNumberChange = (field: keyof ActivityFormData, value: string) => {
        if (field === 'duration') {
            if (value === "") {
                setFormData(prev => ({ ...prev, duration: 0 }));
                return;
            }
            const num = parseInt(value);
            if (!isNaN(num)) {
                setFormData(prev => ({ ...prev, duration: Math.max(0, num) }));
            }
        } else {
            const num = parseInt(value);
            if (!isNaN(num)) {
                setFormData(prev => ({ ...prev, [field]: num }));
            } else if (value === "" && (field === 'amount' || field === 'maxParticipants' || field === 'maleQuota' || field === 'femaleQuota')) {
                // Handle clearing for other specific number fields if needed, e.g., set to 0 or a default
                if (field === 'maxParticipants') {
                    setFormData(prev => ({ ...prev, [field]: 1 })); // Default to 1 for maxParticipants
                } else {
                    setFormData(prev => ({ ...prev, [field]: 0 })); // Default to 0 for others
                }
            }
        }
    }

    // Use useCallback for validateForm to stabilize its reference if formData is the only dependency
    const validateForm = useCallback(() => {
        setIsSubmitted(true)

        if (!formData.title?.trim()) {
            toast.error("請填寫活動標題")
            titleRef.current?.focus()
            return false
        }

        if (formData.title.length > 20) {
            toast.error("活動標題不能超過 20 字")
            titleRef.current?.focus()
            return false
        }

        if (formData.description.length > 500) {
            toast.error("活動說明不能超過 500 字")
            return false
        }

        if (!formData.dateTime) {
            toast.error("請選擇活動日期與時間")
            return false
        }

        if (isBeforeTaipeiToday(formData.dateTime)) {
            toast.error("活動日期不能早於今天")
            return false
        }

        if (!formData.location?.trim()) {
            toast.error("請填寫活動地點")
            locationRef.current?.focus()
            return false
        }

        if (!formData.city) {
            toast.error("請選擇城市")
            return false
        }

        if (!formData.district) {
            toast.error("請選擇行政區")
            return false
        }

        if (formData.duration < 30) {
            toast.error("持續時間至少需要 30 分鐘")
            return false
        }

        if (formData.maxParticipants < 1 || formData.maxParticipants > 100) {
            toast.error("參與人數必須在 1-100 人之間")
            return false
        }

        if (formData.amount < 0) {
            toast.error("費用不能是負數")
            amountRef.current?.focus()
            return false
        }

        if (formData.maleQuota === -1 && formData.femaleQuota === -1) {
            toast.error("不能同時限制男生和女生報名")
            return false
        }

        if (formData.maleQuota === -1 && formData.femaleQuota !== 0) {
            toast.error("限制男生報名時，女生名額必須設為 0 (不限制)")
            return false
        }
        if (formData.femaleQuota === -1 && formData.maleQuota !== 0) {
            toast.error("限制女生報名時，男生名額必須設為 0 (不限制)")
            return false
        }

        if (formData.maleQuota === 0 && formData.femaleQuota === formData.maxParticipants && formData.maxParticipants > 0) {
            toast.error("不限制男生名額時，女生名額不能等於人數上限")
            return false
        }
        if (formData.femaleQuota === 0 && formData.maleQuota === formData.maxParticipants && formData.maxParticipants > 0) {
            toast.error("不限制女生名額時，男生名額不能等於人數上限")
            return false
        }

        if (formData.maleQuota < -1) {
            toast.error("男生名額不能小於 -1")
            return false
        }

        if (formData.femaleQuota < -1) {
            toast.error("女生名額不能小於 -1")
            return false
        }

        if (formData.maleQuota > formData.maxParticipants) {
            toast.error("男生名額不能超過人數上限")
            return false
        }

        if (formData.femaleQuota > formData.maxParticipants) {
            toast.error("女生名額不能超過人數上限")
            return false
        }

        if (formData.maleQuota > 0 && formData.femaleQuota > 0) {
            if (formData.maleQuota + formData.femaleQuota !== formData.maxParticipants) {
                toast.error("男女名額總和必須等於人數上限")
                return false
            }
        }

        return true
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [formData, setIsSubmitted, titleRef, locationRef, amountRef]); // Added all stable and state dependencies

    useEffect(() => {
        if (typeof window !== 'undefined') {
            (window as any).validateActivityForm = validateForm;
        }
    }, [validateForm]); // Dependency is now the stable validateForm

    useEffect(() => {
        if ((formData.femaleQuota <= 0 || formData.femaleQuota === formData.maxParticipants) && formData.femalePriority) {
            setFormData(prev => ({ ...prev, femalePriority: false }));
        }
    }, [formData.femaleQuota, formData.maxParticipants, formData.femalePriority, setFormData]);

    return ( // <--- 確保這裡有括號
        <div className="space-y-8"> {/* Increased general spacing between sections */}
            {/* 基本資訊 */}
            <div className="space-y-4"> {/* Increased spacing within section */}
                <div className="text-lg font-semibold border-b pb-2 mb-4 dark:text-zinc-100 dark:border-zinc-700">基本資訊</div> {/* Enhanced section title */}
                <div className="space-y-2">
                    <Label htmlFor="title" className="dark:text-zinc-100">
                        活動標題 <span className="text-red-500">*</span>
                    </Label>
                    <Input
                        id="title"
                        ref={titleRef}
                        value={formData.title}
                        onChange={e => setFormData(prev => ({ ...prev, title: e.target.value.slice(0, 20) }))}
                        maxLength={20}
                        placeholder="請輸入活動標題"
                        className={cn(
                            "dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-100",
                            isSubmitted && !formData.title?.trim() ? "border-red-500" : ""
                        )}
                    />
                    <div className="text-xs text-muted-foreground">{formData.title?.length || 0}/20</div>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="description" className="dark:text-zinc-100">活動說明</Label>
                    <Textarea
                        id="description"
                        value={formData.description}
                        onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="請輸入活動說明"
                        className="min-h-[100px] dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-100"
                    />
                </div>
            </div>

            {/* 時間設定 */}
            <div className="space-y-4"> {/* Increased spacing within section */}
                <div className="text-lg font-semibold border-b pb-2 mb-4 dark:text-zinc-100 dark:border-zinc-700">時間設定</div> {/* Enhanced section title */}
                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label className="dark:text-zinc-100">活動日期與時間 <span className="text-red-500">*</span></Label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        className={cn(
                                            "w-full justify-start text-left font-normal dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-100",
                                            !formData.dateTime && "text-muted-foreground dark:text-zinc-400",
                                            isSubmitted && !formData.dateTime && "border-red-500"
                                        )}
                                    >
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {formData.dateTime ? formatTaipeiTime(formData.dateTime) : "選擇日期與時間"}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0 dark:bg-zinc-800 dark:border-zinc-700" align="start">
                                    <Calendar
                                        mode="single"
                                        selected={date || undefined}
                                        onSelect={(newDate) => {
                                            setDate(newDate || null);
                                            const currentTime = time || "00:00"; // Default to 00:00 if time is not set
                                            const [hours, minutes] = currentTime.split(':').map(Number);

                                            if (newDate) {
                                                const dateWithTime = new Date(newDate);
                                                dateWithTime.setHours(hours || 0, minutes || 0, 0, 0);
                                                setFormData(prev => ({ ...prev, dateTime: dateWithTime }));
                                            } else { // If date is cleared
                                                setFormData(prev => ({ ...prev, dateTime: null }));
                                            }
                                        }}
                                        disabled={(d) => isBefore(d, startOfTaipeiDay(today)) || isBefore(maxDate, d)}
                                        initialFocus
                                        className="dark:bg-zinc-800 dark:text-zinc-100"
                                    />
                                    <div className="p-3 border-t border-border dark:border-zinc-700">
                                        <Label className="text-sm mb-2 block dark:text-zinc-100">時間</Label>
                                        <Input
                                            type="time"
                                            value={time}
                                            onChange={(e) => {
                                                const newTime = e.target.value;
                                                setTime(newTime);
                                                const currentDate = date || (formData.dateTime ? new Date(formData.dateTime) : null);
                                                if (currentDate && newTime) {
                                                    const [hours, minutes] = newTime.split(':').map(Number);
                                                    const newDateTime = new Date(currentDate);
                                                    newDateTime.setHours(hours || 0, minutes || 0, 0, 0);
                                                    setFormData(prev => ({ ...prev, dateTime: newDateTime }));
                                                } else if (!currentDate && newTime && formData.dateTime) {
                                                    // Case where date is null but formData.dateTime exists (e.g. editing existing)
                                                    // This logic might need refinement based on exact desired UX for editing existing dateTime
                                                    const [hours, minutes] = newTime.split(':').map(Number);
                                                    const newDateTime = new Date(formData.dateTime); // Use existing date part
                                                    newDateTime.setHours(hours || 0, minutes || 0, 0, 0);
                                                    setFormData(prev => ({ ...prev, dateTime: newDateTime }));
                                                }
                                            }}
                                            className="w-full dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-100"
                                        />
                                    </div>
                                </PopoverContent>
                            </Popover>
                            <div className="flex items-center gap-2">
                                <Input
                                    type="number"
                                    min="0"
                                    value={formData.duration}
                                    onChange={e => handleNumberChange('duration', e.target.value)}
                                    className={cn(
                                        "dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-100",
                                        isSubmitted && formData.duration < 30 ? "border-red-500" : ""
                                    )}
                                />
                                <span className="text-sm text-muted-foreground whitespace-nowrap dark:text-zinc-400">分鐘</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* 地點設定 */}
            <div className="space-y-4"> {/* Increased spacing within section */}
                <div className="text-lg font-semibold border-b pb-2 mb-4 dark:text-zinc-100 dark:border-zinc-700">地點設定</div> {/* Enhanced section title */}
                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="location" className="dark:text-zinc-100">
                            活動地點 <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            id="location"
                            ref={locationRef}
                            value={formData.location}
                            onChange={e => setFormData(prev => ({ ...prev, location: e.target.value.slice(0, 20) }))}
                            maxLength={20}
                            placeholder="請輸入活動地點"
                            className={cn(
                                "dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-100",
                                isSubmitted && !formData.location?.trim() ? "border-red-500" : ""
                            )}
                        />
                        <div className="text-xs text-muted-foreground">{formData.location?.length || 0}/20</div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        <div className="space-y-2">
                            <Label className="dark:text-zinc-100">
                                城市 <span className="text-red-500">*</span>
                            </Label>
                            <Select
                                value={formData.city}
                                onValueChange={handleCityChange}
                            >
                                <SelectTrigger className={cn(
                                    "dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-100",
                                    isSubmitted && !formData.city ? "border-red-500" : ""
                                )}>
                                    <SelectValue placeholder="選擇城市" className="dark:text-zinc-400" />
                                </SelectTrigger>
                                <SelectContent className="dark:bg-zinc-800 dark:border-zinc-700">
                                    {LOCATIONS.cities.map(c => (
                                        <SelectItem
                                            key={c.id}
                                            value={c.name}
                                            className="dark:text-zinc-100 dark:focus:bg-zinc-700 dark:hover:bg-zinc-700"
                                        >
                                            {c.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label className="dark:text-zinc-100">
                                行政區 <span className="text-red-500">*</span>
                            </Label>
                            <Select
                                value={formData.district}
                                onValueChange={district => setFormData(prev => ({ ...prev, district }))}
                                disabled={!formData.city}
                            >
                                <SelectTrigger className={cn(
                                    "dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-100",
                                    isSubmitted && !formData.district ? "border-red-500" : ""
                                )}>
                                    <SelectValue placeholder="選擇行政區" className="dark:text-zinc-400" />
                                </SelectTrigger>
                                <SelectContent className="dark:bg-zinc-800 dark:border-zinc-700">
                                    {formData.city &&
                                        LOCATIONS.cities
                                            .find(c => c.name === formData.city)
                                            ?.districts.map(d => (
                                                <SelectItem
                                                    key={d.id}
                                                    value={d.name}
                                                    className="dark:text-zinc-100 dark:focus:bg-zinc-700 dark:hover:bg-zinc-700"
                                                >
                                                    {d.name}
                                                </SelectItem>
                                            ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>
            </div>

            {/* 活動設定 */}
            <div className="space-y-4">
                <div className="text-lg font-semibold border-b pb-2 mb-4 dark:text-zinc-100 dark:border-zinc-700">活動設定</div> {/* Enhanced section title */}

                <div className="space-y-2">
                    <Label htmlFor="netType" className="dark:text-zinc-100">
                        網別 <span className="text-red-500">*</span>
                    </Label>
                    <Select
                        value={formData.netType}
                        onValueChange={(value: 'MEN' | 'WOMEN' | 'MIXED') =>
                            setFormData(prev => ({ ...prev, netType: value }))
                        }
                    >
                        <SelectTrigger className="dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-100">
                            <SelectValue placeholder="選擇網別" />
                        </SelectTrigger>
                        <SelectContent className="dark:bg-zinc-800 dark:border-zinc-700">
                            {NET_TYPES.map(type => (
                                <SelectItem
                                    key={type.value}
                                    value={type.value}
                                    className="dark:text-zinc-100 dark:focus:bg-zinc-700 dark:hover:bg-zinc-700"
                                >
                                    {type.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="maxParticipants" className="dark:text-zinc-100">
                            人數上限（包含自己） <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            id="maxParticipants"
                            type="number"
                            min="1"
                            max="100"
                            value={formData.maxParticipants}
                            onChange={e => {
                                const value = parseInt(e.target.value);
                                if (!isNaN(value)) {
                                    setFormData(prev => ({
                                        ...prev,
                                        maxParticipants: Math.min(Math.max(value, 1), 100)
                                    }));
                                } else if (e.target.value === "") {
                                    setFormData(prev => ({ ...prev, maxParticipants: 1 }));
                                }
                            }}
                            className={cn(
                                "dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-100",
                                isSubmitted && (formData.maxParticipants < 1 || formData.maxParticipants > 100) ? "border-red-500" : ""
                            )}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="amount" className="dark:text-zinc-100">
                            費用/人 <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            id="amount"
                            ref={amountRef}
                            type="number"
                            min="0"
                            step="5"
                            value={formData.amount}
                            onChange={e => handleNumberChange('amount', e.target.value)}
                            className={cn(
                                "dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-100",
                                isSubmitted && formData.amount < 0 ? "border-red-500" : ""
                            )}
                        />
                    </div>
                </div>

                <Collapsible>
                    <div className="flex items-center space-x-2 mb-2">
                        <CollapsibleTrigger asChild>
                            <Button variant="ghost" size="sm" className="hover:bg-transparent hover:text-primary p-0 h-auto dark:text-zinc-100 dark:hover:text-primary">
                                <ChevronDown className="h-4 w-4" />
                                <span className="ml-1">進階設定</span>
                            </Button>
                        </CollapsibleTrigger>
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger>
                                    <Info className="h-4 w-4 text-muted-foreground" />
                                </TooltipTrigger>
                                <TooltipContent className="dark:bg-zinc-900 dark:text-zinc-100 dark:border-zinc-700">
                                    <p>設定性別名額限制和優先順序</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </div>

                    <CollapsibleContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <div className="flex items-center gap-1">
                                    <Label htmlFor="maleQuota" className="dark:text-zinc-100">
                                        男生名額上限
                                    </Label>
                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger>
                                                <Info className="h-4 w-4 text-muted-foreground" />
                                            </TooltipTrigger>
                                            <TooltipContent className="dark:bg-zinc-900 dark:text-zinc-100 dark:border-zinc-700">
                                                <div className="flex gap-2"><span className="w-12">-1</span><span>禁止男生報名</span></div>
                                                <div className="flex gap-2"><span className="w-12">0</span><span>不限制男生人數</span></div>
                                                <div className="flex gap-2"><span className="w-12">&gt;0</span><span>限制男生最多報名人數</span></div>
                                                <div className="mt-1 text-sm text-muted-foreground">※ 不能超過總人數上限（{formData.maxParticipants} 人）</div>
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                </div>
                                <Input
                                    id="maleQuota"
                                    type="number"
                                    min={-1}
                                    max={formData.maxParticipants}
                                    value={formData.maleQuota}
                                    onChange={e => {
                                        const value = parseInt(e.target.value);
                                        if (!isNaN(value)) {
                                            setFormData(prev => ({
                                                ...prev,
                                                maleQuota: Math.min(Math.max(value, -1), formData.maxParticipants)
                                            }));
                                        } else if (e.target.value === "") {
                                            setFormData(prev => ({ ...prev, maleQuota: 0 }));
                                        }
                                    }}
                                    className={cn(
                                        "dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-100",
                                        (isSubmitted && (formData.maleQuota > formData.maxParticipants || formData.maleQuota < -1)) ? "border-red-500" : ""
                                    )}
                                />
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center gap-1">
                                    <Label htmlFor="femaleQuota" className="dark:text-zinc-100">
                                        女生名額上限
                                    </Label>
                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger>
                                                <Info className="h-4 w-4 text-muted-foreground" />
                                            </TooltipTrigger>
                                            <TooltipContent className="dark:bg-zinc-900 dark:text-zinc-100 dark:border-zinc-700">
                                                <div className="flex gap-2"><span className="w-12">-1</span><span>禁止女生報名</span></div>
                                                <div className="flex gap-2"><span className="w-12">0</span><span>不限制女生人數</span></div>
                                                <div className="flex gap-2"><span className="w-12">&gt;0</span><span>限制女生最多報名人數</span></div>
                                                <div className="mt-1 text-sm text-muted-foreground">※ 不能超過總人數上限（{formData.maxParticipants} 人）</div>
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                </div>
                                <Input
                                    id="femaleQuota"
                                    type="number"
                                    min={-1}
                                    max={formData.maxParticipants}
                                    value={formData.femaleQuota}
                                    onChange={e => {
                                        const value = parseInt(e.target.value);
                                        if (!isNaN(value)) {
                                            setFormData(prev => ({
                                                ...prev,
                                                femaleQuota: Math.min(Math.max(value, -1), formData.maxParticipants)
                                            }));
                                        } else if (e.target.value === "") {
                                            setFormData(prev => ({ ...prev, femaleQuota: 0 }));
                                        }
                                    }}
                                    className={cn(
                                        "dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-100",
                                        (isSubmitted && (formData.femaleQuota > formData.maxParticipants || formData.femaleQuota < -1)) ? "border-red-500" : ""
                                    )}
                                />
                            </div>
                        </div>

                        <div className="flex items-center space-x-2">
                            <Switch
                                id="femalePriority"
                                checked={formData.femalePriority}
                                onCheckedChange={checked =>
                                    setFormData(prev => ({ ...prev, femalePriority: checked }))
                                }
                                disabled={formData.femaleQuota <= 0 || formData.femaleQuota === formData.maxParticipants}
                                className="dark:[&>span]:bg-zinc-600 dark:data-[state=checked]:[&>span]:bg-primary"
                            />
                            <div className="flex items-center gap-1">
                                <Label htmlFor="femalePriority" className={cn(
                                    "dark:text-zinc-100",
                                    (formData.femaleQuota <= 0 || formData.femaleQuota === formData.maxParticipants) &&
                                    "text-muted-foreground cursor-not-allowed"
                                )}>
                                    女生優先報名
                                </Label>
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger>
                                            <Info className="h-4 w-4 text-muted-foreground" />
                                        </TooltipTrigger>
                                        <TooltipContent className="dark:bg-zinc-900 dark:text-zinc-100 dark:border-zinc-700">
                                            <p>開啟此選項後：</p>
                                            <p>• 當女生名額未滿時，將優先保留給女生報名</p>
                                            <p>• 男生報名將進入候補名單</p>
                                            <p>• 待女生名額額滿後，男生才能依序遞補</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            </div>
                        </div>
                    </CollapsibleContent>
                </Collapsible>
            </div>
        </div>
    )
}