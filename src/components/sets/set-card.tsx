import { StarIcon } from "@heroicons/react/24/solid";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Chip } from "@heroui/chip";
import Image from "next/image";
import { SetRatingInput } from "@/components/sets/set-rating-input";
import { ToggleCollectionButton } from "@/components/sets/toggle-collection-button";
import type { Wave } from "@/domain/sets";
import type { SetViewModel } from "@/domain/view-models/set.view-model";
import { cn } from "@/styles/cn";

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
          <AverageRatingChip averageRating={set.averageRating} />
        </div>
      </CardHeader>
      <CardBody className="px-3 py-2">
        <h3 className="mb-1 text-sm font-semibold">{set.name}</h3>
        <p className="text-xs font-semibold mb-1">{set.catalogNumber}</p>
        <p className="text-xs text-default-500 mb-1">
          {set.releaseYear} • {wave}
        </p>
        <SetRatingInput
          setNumber={set.catalogNumber}
          userRating={set.userRating}
        />
      </CardBody>
    </Card>
  );
}

function AverageRatingChip({ averageRating }: { averageRating?: number }) {
  return (
    <Chip
      size="sm"
      color="warning"
      variant="flat"
      startContent={<StarIcon className="h-3.5 w-3.5 text-warning" />}
      className={cn(
        "absolute right-2 bottom-2 z-10 bg-black/50 text-white backdrop-blur-sm",
        "border-0 [--chip-label:var(--color-white)]",
      )}
      role="img"
      aria-label={
        averageRating ? `Average rating ${averageRating}` : "No ratings yet"
      }
    >
      {averageRating ? averageRating : "–"}
    </Chip>
  );
}
