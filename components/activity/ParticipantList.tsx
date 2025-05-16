import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Position, Level } from "@/lib/constants"
import { UserCard } from "@/components/user/UserCard"
import { ActivityParticipantDto } from "@/lib/types/activity"
import { EmptyState } from "@/components/ui/EmptyState"
import { CaptainViewParticipantDetails } from "@/lib/apiService";

interface ParticipantListProps {
  participants: ActivityParticipantDto[];
  isWaiting?: boolean;
  activityCaptainId: string;
  currentUserId: string;
  activityId: string;
  participantDetailsForCaptainView?: Map<string, CaptainViewParticipantDetails> | null;
}

export function ParticipantList({ participants, isWaiting = false, participantDetailsForCaptainView }: ParticipantListProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{isWaiting ? "候補名單" : "參與者列表"}</CardTitle>
          <Badge variant="outline" className="text-base px-3">
            {participants.length} 人
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        {participants.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {participants.map((participant, index) => {
              const captainDetails = participantDetailsForCaptainView?.get(String(participant.userId));
              return (
                <div key={participant.id} className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-lg text-gray-700">{index + 1}.</span>
                    <Link href={`/profile/${participant.userId}`} className="flex-grow">
                      <UserCard
                        userId={participant.userId}
                        nickname={participant.nickname}
                        avatar={participant.avatar}
                        position={participant.position as Position}
                        level={participant.level as Level | null}
                        volleyballAge={participant.volleyballAge}
                        isCaptain={participant.isCaptain}
                        isWaiting={isWaiting}
                        gender={participant.gender}
                      />
                    </Link>
                  </div>
                  {captainDetails && (
                    <Card className="p-2 text-xs ml-6 bg-muted/70 dark:bg-muted/40 border border-muted-foreground/30 rounded-md">
                      {(captainDetails.realName || captainDetails.phone) ? (
                        <p className="text-foreground/80 dark:text-foreground/70">
                          {captainDetails.realName && `姓名: ${captainDetails.realName}`}
                          {captainDetails.realName && captainDetails.phone && " | "}
                          {captainDetails.phone && `電話: ${captainDetails.phone}`}
                        </p>
                      ) : (
                        <p className="text-xs text-muted-foreground italic">無詳細報名資訊</p>
                      )}
                    </Card>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <EmptyState message={isWaiting ? "目前沒有人在候補" : "目前還沒有人報名"} />
        )}
      </CardContent>
    </Card>
  )
}