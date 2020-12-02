import { getConnection, InsertResult } from 'typeorm';
import { AaveUserAccountData } from '../../entity/AaveUserAccountData';
import { AaveUserReserveData } from '../../entity/AaveUserReserveData';
import { UserAccountData, UserReserveData } from '../../interfaces';

export function saveUserAccountData(
  user: string,
  userAccountData: UserAccountData
): Promise<InsertResult> {
  return getConnection()
    .createQueryBuilder()
    .insert()
    .into(AaveUserAccountData)
    .values([Object.assign({}, { user }, userAccountData)])
    .execute();
}

export function saveUserReserveDataPlaceholder(
  user: string,
  reserves: string[]
): Promise<InsertResult> {
  const values = reserves.map((reserve: string) => ({ user, reserve }));
  return getConnection()
    .createQueryBuilder()
    .insert()
    .into(AaveUserReserveData)
    .values(values)
    .execute();
}

export function saveUserReserveData(
  user: string,
  reserve: string,
  userReserveData: UserReserveData
): Promise<InsertResult> {
  const values = reserves.map((reserve: string) => ({ user, reserve }));
  return getConnection()
    .createQueryBuilder()
    .update(AaveUserReserveData)
    .set(userReserveData)
    .execute();
}

export function selectAllPlaceholderUserReserveData() {
  return getConnection()
    .createQueryBuilder()
    .select('user', 'reserve')
    .from(AaveUserReserveData, 'reserveData')
    .where('lastUpdateTimestamp = :entry', { entry: null })
    .getMany();
}

// get latest block checked

export function getAllCollateralTokens() {
  return getConnection()
    .createQueryBuilder()
    .select('reserve')
    .from(AaveUserReserveData, 'reserveData')
    .where('usageAsCollateralEnabled = :bool', { bool: true })
    .getMany();
}
