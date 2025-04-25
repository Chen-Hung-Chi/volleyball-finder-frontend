import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { User } from "@/lib/types";
import { POSITIONS, LEVELS, GENDERS } from "@/lib/constants";
import { cn } from "@/lib/utils";

interface UserProfileCardProps {
  user: User;
  isCurrentUser: boolean;
}

const ProfileDetailBadge = ({ label, value }: { label: string, value: string | number | undefined | null }) => {
  const hasValue = !(value === null || value === undefined || value === '');

  let displayValue: React.ReactNode = value;
  if (label === '位置' && typeof value === 'string') {
    displayValue = POSITIONS.find(p => p.value === value)?.label || value;
  } else if (label === '程度' && typeof value === 'string') {
    displayValue = LEVELS.find(l => l.value === value)?.label || value;
  } else if (label === '性別' && typeof value === 'string') {
    displayValue = GENDERS.find(g => g.value === value)?.label || value;
  } else if (label === '球齡' && typeof value === 'number') {
      displayValue = `${value} 年`;
  }

  return (
    <div className="flex flex-col space-y-1">
      <h3 className="text-sm font-medium text-muted-foreground">{label}</h3>
      <p className={cn(
          "text-base font-semibold",
          !hasValue && "text-sm font-normal text-muted-foreground italic"
        )}>
        {hasValue ? displayValue : "未設定"}
      </p>
    </div>
  );
};

export function UserProfileCard({ user, isCurrentUser }: UserProfileCardProps) {
  const router = useRouter();

  return (
    <Card className="border border-border/40 shadow-sm hover:shadow-md transition-shadow duration-200">
      <CardHeader className="p-6 border-b">
        <div className="flex items-center justify-between space-x-4">
          <div className="flex items-center space-x-4">
            <Avatar className="h-20 w-20 border">
              <AvatarImage src={user.avatar} alt={user.nickname} />
              <AvatarFallback className="text-xl">{user.nickname?.[0]}</AvatarFallback>
            </Avatar>
            <div className="space-y-1">
              <CardTitle className="text-3xl font-bold tracking-tight">{user.nickname}</CardTitle>
              <CardDescription className="text-base text-muted-foreground">{user.realName}</CardDescription>
            </div>
          </div>
          {isCurrentUser && (
            <Button variant="outline" size="sm" onClick={() => router.push('/profile')}>編輯資料</Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid gap-x-6 gap-y-5 grid-cols-2 mb-8">
          <ProfileDetailBadge label="位置" value={user.position} />
          <ProfileDetailBadge label="程度" value={user.level} />
          <ProfileDetailBadge label="球齡" value={user.volleyballAge} />
          <ProfileDetailBadge label="性別" value={user.gender} />
        </div>

        {user.introduction && (
          <div className="mt-6 space-y-2">
            <h3 className="text-sm font-medium text-muted-foreground">自我介紹</h3>
            <p className="text-base text-foreground/90 whitespace-pre-wrap leading-relaxed">
              {user.introduction}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 