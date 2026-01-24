import { prisma, RundownItemType, ItemStatus, RundownStatus } from '@hnms/database';

export async function createShow(data: { stationId: string; name: string; description?: string; defaultDuration?: number; }) {
  const slug = data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  return prisma.show.create({
    data: {
      ...data,
      slug,
    },
  });
}

export async function getShows(stationId: string) {
  return prisma.show.findMany({
    where: { stationId, isActive: true },
    orderBy: { name: 'asc' },
  });
}

export async function createShowInstance(data: { showId: string; airDate: Date; startTime: Date; endTime: Date; }) {
  // Create instance with empty rundown
  const instance = await prisma.showInstance.create({
    data: {
      ...data,
      rundown: {
        create: {
          status: 'DRAFT' as RundownStatus,
        },
      },
    },
    include: {
      show: true,
      rundown: true,
    },
  });
  return instance;
}

export async function getRundown(rundownId: string) {
  return prisma.rundown.findUnique({
    where: { id: rundownId },
    include: {
      showInstance: {
        include: { show: true },
      },
      items: {
        orderBy: { position: 'asc' },
        include: {
          story: {
            select: { id: true, title: true, wordCount: true, status: true },
          },
        },
      },
    },
  });
}

export async function addRundownItem(data: { rundownId: string; type: RundownItemType; title: string; plannedDuration: number; storyId?: string; script?: string; notes?: string; }) {
  // Get current max position
  const lastItem = await prisma.rundownItem.findFirst({
    where: { rundownId: data.rundownId },
    orderBy: { position: 'desc' },
  });
  const position = (lastItem?.position ?? -1) + 1;
  const item = await prisma.rundownItem.create({
    data: {
      ...data,
      position,
    },
    include: {
      story: {
        select: { id: true, title: true, wordCount: true },
      },
    },
  });
  // Update total duration
  await updateRundownDuration(data.rundownId);
  return item;
}

export async function updateRundownItem(itemId: string, data: { title?: string; plannedDuration?: number; script?: string; notes?: string; status?: ItemStatus; }) {
  const item = await prisma.rundownItem.update({
    where: { id: itemId },
    data,
    include: { story: true },
  });
  await updateRundownDuration(item.rundownId);
  return item;
}

export async function reorderRundownItems(rundownId: string, itemIds: string[]) {
  // Update positions based on new order
  const updates = itemIds.map((id, index) =>
    prisma.rundownItem.update({
      where: { id },
      data: { position: index },
    })
  );
  await prisma.$transaction(updates);
  return getRundown(rundownId);
}

export async function deleteRundownItem(itemId: string) {
  const item = await prisma.rundownItem.delete({
    where: { id: itemId },
  });
  await updateRundownDuration(item.rundownId);
  // Reorder remaining items
  const remaining = await prisma.rundownItem.findMany({
    where: { rundownId: item.rundownId },
    orderBy: { position: 'asc' },
  });
  const updates = remaining.map((item, index) =>
    prisma.rundownItem.update({
      where: { id: item.id },
      data: { position: index },
    })
  );
  await prisma.$transaction(updates);
}

async function updateRundownDuration(rundownId: string) {
  const items = await prisma.rundownItem.findMany({
    where: { rundownId },
  });
  const totalDuration = items.reduce((sum, item) => sum + item.plannedDuration, 0);
  await prisma.rundown.update({
    where: { id: rundownId },
    data: { totalDuration },
  });
}