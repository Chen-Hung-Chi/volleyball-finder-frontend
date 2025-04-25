import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Position, Level } from "@/lib/constants"
import { UserCard } from "@/components/user/UserCard"
import { ActivityParticipantDto } from "@/lib/types/activity"
import { EmptyState } from "@/components/ui/EmptyState"

interface ParticipantListProps {
  participants: ActivityParticipantDto[];
  isWaiting?: boolean;
}

export function ParticipantList({ participants, isWaiting = false }: ParticipantListProps) {
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
            {participants.map((participant) => (
              <UserCard
                key={participant.id}
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
            ))}
          </div>
        ) : (
          <EmptyState message={isWaiting ? "目前沒有人在候補" : "目前還沒有人報名"} />
        )}
      </CardContent>
    </Card>
  )
}