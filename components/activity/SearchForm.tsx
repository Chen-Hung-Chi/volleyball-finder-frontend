import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { CalendarIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { LOCATIONS, CityCode, DistrictCode } from "@/lib/constants"
import { SearchParams } from "@/lib/types"
import { SearchFormProps } from "@/lib/types/activity"
import { format, startOfDay, isBefore } from "date-fns"
import { zhTW } from "date-fns/locale"

const TIMEZONE_OFFSET = 8; // 台灣是 UTC+8

// 獲取台灣現在時間
const getTaipeiNow = () => {
  // 使用 toLocaleString 來獲取台北時間
  const now = new Date();
  return new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Taipei' }));
}

// 獲取台灣時間的今天日期（不含時間）
const getTaipeiToday = () => {
  return startOfDay(getTaipeiNow());
}

// 將日期字符串轉換為 Date 對象，並確保是台北時間
const parseDate = (dateStr: string) => {
  // 如果日期字符串沒有時區信息，假設它是台北時間
  if (!dateStr.includes('Z') && !dateStr.includes('+')) {
    const date = new Date(dateStr);
    return new Date(date.toLocaleString('en-US', { timeZone: 'Asia/Taipei' }));
  }
  return new Date(dateStr);
}

// 獲取有效的開始日期（預設為今天，但不允許選擇今天之前的日期）
const getValidStartDate = (dateStr?: string) => {
  const today = getTaipeiToday();
  
  if (!dateStr) {
    return format(today, "yyyy-MM-dd");
  }

  const date = startOfDay(parseDate(dateStr));
  // 如果日期在今天之前，則返回今天
  return isBefore(date, today) ? format(today, "yyyy-MM-dd") : format(date, "yyyy-MM-dd");
}

export function SearchForm({ onSearch, initialValues }: SearchFormProps) {
  const [searchState, setSearchState] = useState<SearchParams>(() => {
    return {
      ...initialValues,
      title: initialValues.title || "",
      location: initialValues.location || "",
      city: initialValues.city,
      district: initialValues.district,
      page: initialValues.page || 1,
      limit: initialValues.limit || 12,
      startDate: getValidStartDate(initialValues.startDate)
    };
  });

  const prevInitialValuesRef = useRef(initialValues);

  // 當 initialValues 改變時更新 searchState
  useEffect(() => {
    const prevValues = prevInitialValuesRef.current;
    // 只有當 initialValues 中的值與之前的值不同時才更新
    const hasChanged = 
      initialValues.title !== prevValues.title ||
      initialValues.location !== prevValues.location ||
      initialValues.city !== prevValues.city ||
      initialValues.district !== prevValues.district ||
      initialValues.startDate !== prevValues.startDate ||
      initialValues.endDate !== prevValues.endDate ||
      initialValues.page !== prevValues.page;

    if (hasChanged) {
      setSearchState(prev => ({
        ...prev,
        ...initialValues,
        title: initialValues.title || prev.title || "",
        location: initialValues.location || prev.location || "",
        city: initialValues.city || prev.city,
        district: initialValues.district || prev.district,
        page: initialValues.page || prev.page,
        limit: initialValues.limit || prev.limit,
        startDate: getValidStartDate(initialValues.startDate), // 使用 getValidStartDate 確保日期有效
        endDate: initialValues.endDate // 結束日期的處理保持不變
      }));
      prevInitialValuesRef.current = initialValues;
    }
  }, [initialValues]);

  // 當城市改變時，重置地區
  useEffect(() => {
    const cityDistricts = searchState.city
      ? LOCATIONS.cities.find((c) => c.code === searchState.city)?.districts || []
      : [];
      
    if (searchState.city && searchState.district && 
        !cityDistricts.some(d => d.code === searchState.district)) {
      setSearchState(prev => ({
        ...prev,
        district: undefined
      }));
    }
  }, [searchState.city]);

  // 取得當前城市的地區列表
  const districts = searchState.city
    ? LOCATIONS.cities.find((c) => c.code === searchState.city)?.districts || []
    : [];

  const handleClear = () => {
    const clearedState: SearchParams = {
      page: 1,
      limit: searchState.limit,
      startDate: getValidStartDate(), // 使用 getValidStartDate 獲取有效的開始日期
      endDate: undefined,
      title: "",
      location: "",
      city: undefined,
      district: undefined
    };
    setSearchState(clearedState);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // 確保在搜索時包含 endDate
    onSearch({
      ...searchState,
      page: 1 // 重置頁碼
    });
  };

  return (
    <form onSubmit={handleSubmit} className="bg-card rounded-xl p-6 shadow-sm">
      <div className="space-y-6">
        {/* 地點搜尋和地區選擇 */}
        <div className="space-y-2">
          <div className="text-sm font-medium">地點搜尋</div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            <Input
              placeholder="搜尋地點名稱"
              value={searchState.location || ""}
              onChange={(e) => setSearchState(prev => ({ ...prev, location: e.target.value }))}
              className="md:col-span-1"
            />
            <Select
              value={searchState.city || "all"}
              onValueChange={(value) => {
                if (value === "all") {
                  setSearchState(prev => ({
                    ...prev,
                    city: undefined,
                    district: undefined
                  }));
                } else {
                  setSearchState(prev => ({
                    ...prev,
                    city: value as CityCode,
                    district: undefined
                  }));
                }
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="全部城市" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部城市</SelectItem>
                {LOCATIONS.cities.map((city) => (
                  <SelectItem key={city.code} value={city.code}>
                    {city.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={searchState.district || "all"}
              onValueChange={(value) => {
                if (value === "all") {
                  setSearchState(prev => ({
                    ...prev,
                    district: undefined
                  }));
                } else {
                  setSearchState(prev => ({
                    ...prev,
                    district: value as DistrictCode
                  }));
                }
              }}
              disabled={!searchState.city}
            >
              <SelectTrigger>
                <SelectValue placeholder="全部地區" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部地區</SelectItem>
                {districts.map((district) => (
                  <SelectItem key={district.code} value={district.code}>
                    {district.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* 日期選擇 */}
        <div className="space-y-2">
          <div className="text-sm font-medium">日期選擇</div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !searchState.startDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {searchState.startDate ? (
                    format(parseDate(searchState.startDate), "yyyy-MM-dd", { locale: zhTW })
                  ) : (
                    <span>選擇開始日期</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={searchState.startDate ? parseDate(searchState.startDate) : undefined}
                  onSelect={(date) => {
                    if (date) {
                      setSearchState(prev => ({
                        ...prev,
                        startDate: format(date, "yyyy-MM-dd")
                      }));
                    }
                  }}
                  disabled={(date) => isBefore(date, getTaipeiToday())}
                  initialFocus
                />
              </PopoverContent>
            </Popover>

            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !searchState.endDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {searchState.endDate ? (
                    format(parseDate(searchState.endDate), "yyyy-MM-dd", { locale: zhTW })
                  ) : (
                    <span>結束日期</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={searchState.endDate ? parseDate(searchState.endDate) : undefined}
                  onSelect={(date) => {
                    if (date) {
                      setSearchState(prev => ({
                        ...prev,
                        endDate: format(date, "yyyy-MM-dd")
                      }));
                    }
                  }}
                  disabled={(date) => 
                    searchState.startDate ? isBefore(date, parseDate(searchState.startDate)) : false
                  }
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {/* 按鈕區域 */}
        <div className="flex justify-end space-x-2">
          <Button
            type="button"
            variant="outline"
            onClick={handleClear}
          >
            清除條件
          </Button>
          <Button type="submit">搜尋活動</Button>
        </div>
      </div>
    </form>
  );
} 