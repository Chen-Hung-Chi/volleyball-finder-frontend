import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { User } from "@/lib/types";
import { POSITIONS, LEVELS, GENDERS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle, faIdCard } from '@fortawesome/free-solid-svg-icons';

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
      <CardHeader className="p-5 border-b rounded-t-md">
        <div className="flex items-center justify-between space-x-4">
          <div className="flex items-center space-x-4">
            <Avatar className="h-20 w-20 border">
              <AvatarImage src={user.avatar} alt={user.nickname} />
              <AvatarFallback className="text-xl">{user.nickname?.[0]}</AvatarFallback>
            </Avatar>
            <div className="space-y-1">
              <div className="flex items-center space-x-3">
                <CardTitle className="text-2xl font-bold tracking-tight">{user.nickname}</CardTitle>
                {user.isVerified ? (
                  <span className="inline-flex items-center gap-1 rounded-md bg-green-100 text-green-700 px-2 py-0.5 font-medium text-sm dark:bg-green-900 dark:text-green-300">
                    <FontAwesomeIcon icon={faCheckCircle} className="mr-1 text-green-500 dark:text-green-300" />
                    已認證
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 rounded-md bg-gray-100 text-gray-500 px-2 py-0.5 font-normal text-xs dark:bg-gray-700 dark:text-gray-400">
                    未認證
                  </span>
                )}
              </div>
              {!user.isVerified ? (
                <CardDescription className="text-base text-muted-foreground">{user.realName}</CardDescription>
              ) : null}
            </div>
          </div>
          {isCurrentUser && (
            <Button variant="outline" size="sm" onClick={() => router.push('/profile')}>編輯資料</Button>
          )}
        </div>
      </CardHeader>
      <hr className="border-border/30 dark:border-border/20" />
      <CardContent className="p-5">
        <div className="grid gap-x-4 gap-y-4 grid-cols-2 mb-4">
          <ProfileDetailBadge label="位置" value={user.position} />
          <ProfileDetailBadge label="程度" value={user.level} />
          <ProfileDetailBadge label="球齡" value={user.volleyballAge} />
          <ProfileDetailBadge label="性別" value={user.gender} />
        </div>

        {user.introduction && (
          <div className="mt-6 space-y-2 bg-muted/50 dark:bg-zinc-800/60 rounded p-4">
            <h3 className="text-sm font-medium text-muted-foreground">自我介紹</h3>
            <p className="text-lg text-foreground/90 whitespace-pre-wrap leading-relaxed">
              {user.introduction}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}