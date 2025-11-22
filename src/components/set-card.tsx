import { Card, CardBody, CardHeader } from "@heroui/card";
import Image from "next/image";
import type { BionicleSet } from "@/data/sets";

type Props = {
  set: BionicleSet;
};

export function SetCard({ set }: Props) {
  return (
    <Card shadow="sm" isHoverable isPressable>
      <CardHeader className="p-0 w-60 h-50 relative">
        <Image
          alt={`${set.catalogNumber} ${set.name} set image`}
          src={`/sets/${set.imageName}`}
          fill={true}
          objectFit="cover"
        />
      </CardHeader>
      <CardBody className="text-medium gap-2">
        <div className="flex flex-row gap-1.5">
          <span className="font-bold">{set.catalogNumber}</span>
          <span>{set.name}</span>
        </div>
        <div className="flex flex-col text-default-500 text-small">
          <span>{set.releaseYear}</span>
          <span>{set.wave}</span>
        </div>
      </CardBody>
    </Card>
  );
}
