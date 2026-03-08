import { Card, CardBody, CardHeader } from "@heroui/card";
import Image from "next/image";
import { SetRatingInput } from "@/components/sets/set-rating-input";
import { ToggleCollectionButton } from "@/components/sets/toggle-collection-button";
import type { Wave } from "@/domain/sets";
import type { SetViewModel } from "@/domain/view-models/set.view-model";

type SetCardProps = {
  set: SetViewModel;
  wave: Wave;
};

export function SetCard({ set, wave }: SetCardProps) {
  return (
    <Card
      isPressable={false}
      className="overflow-hidden transition-transform hover:scale-105"
    >
      <CardHeader className="p-0">
        <div className="relative aspect-square min-h-[120px] w-full bg-default-100">
          <Image
            src={`/sets/${set.imageName}`}
            alt={set.name}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1280px) 33vw, 16vw"
          />
          <ToggleCollectionButton
            setNumber={set.catalogNumber}
            isInCollection={set.isInCollection}
          />
        </div>
      </CardHeader>
      <CardBody className="px-3 py-2">
        <h3 className="mb-1 text-sm font-semibold">{set.name}</h3>
        <p className="text-xs font-semibold mb-1">{set.catalogNumber}</p>
        <p className="text-xs text-default-500 mb-1">
          {set.releaseYear} • {wave}
        </p>
        <p className="text-xs text-default-500 mb-1">
          {set.averageRating ? `Avg ${set.averageRating}` : "No ratings"}
        </p>
        <SetRatingInput
          setNumber={set.catalogNumber}
          userRating={set.userRating}
        />
      </CardBody>
    </Card>
  );
}
