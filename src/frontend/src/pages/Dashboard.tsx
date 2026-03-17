import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  ArrowDownCircle,
  ArrowUpCircle,
  Calendar,
  Coins,
  Gamepad2,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { backendInterface } from "../backend";

interface DashboardProps {
  actor: backendInterface | null;
  isFetching: boolean;
  onRefresh: () => void;
}

export default function Dashboard({
  actor,
  isFetching,
  onRefresh,
}: DashboardProps) {
  const [depositAmount, setDepositAmount] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");

  const profileQuery = useQuery({
    queryKey: ["dashboard_profile"],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !isFetching,
  });

  const balanceQuery = useQuery({
    queryKey: ["dashboard_balance"],
    queryFn: async () => {
      if (!actor) return 0n;
      return actor.getBalance();
    },
    enabled: !!actor && !isFetching,
  });

  const txQuery = useQuery({
    queryKey: ["transactions"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getTransactionHistory();
    },
    enabled: !!actor && !isFetching,
  });

  const depositMutation = useMutation({
    mutationFn: async (amount: bigint) => {
      if (!actor) throw new Error("No actor");
      await actor.deposit(amount);
    },
    onSuccess: () => {
      toast.success("Credits deposited!");
      setDepositAmount("");
      balanceQuery.refetch();
      profileQuery.refetch();
      txQuery.refetch();
      onRefresh();
    },
    onError: () => toast.error("Deposit failed"),
  });

  const withdrawMutation = useMutation({
    mutationFn: async (amount: bigint) => {
      if (!actor) throw new Error("No actor");
      await actor.withdraw(amount);
    },
    onSuccess: () => {
      toast.success("Credits withdrawn!");
      setWithdrawAmount("");
      balanceQuery.refetch();
      profileQuery.refetch();
      txQuery.refetch();
      onRefresh();
    },
    onError: () => toast.error("Withdrawal failed. Check your balance."),
  });

  const profile = profileQuery.data;
  const balance = balanceQuery.data ?? 0n;
  const transactions = txQuery.data ?? [];

  const formatDate = (ts: bigint) => {
    const ms = Number(ts / 1_000_000n);
    return new Date(ms).toLocaleDateString();
  };

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="font-display text-4xl font-bold text-foreground mb-2">
          {profile ? `Welcome back, ${profile.username}` : "Dashboard"}
        </h1>
        <p className="text-muted-foreground">Manage your account and credits</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card className="casino-card">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-primary/15 flex items-center justify-center">
                <Coins className="w-5 h-5 text-primary" />
              </div>
              <span className="text-sm text-muted-foreground">Balance</span>
            </div>
            {balanceQuery.isLoading ? (
              <Skeleton
                className="h-8 w-32"
                data-ocid="dashboard.loading_state"
              />
            ) : (
              <p className="text-3xl font-bold text-primary font-display">
                {Number(balance).toLocaleString()}
                <span className="text-base font-normal text-muted-foreground ml-1">
                  Credits
                </span>
              </p>
            )}
          </CardContent>
        </Card>

        <Card className="casino-card">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-green-900/30 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-green-400" />
              </div>
              <span className="text-sm text-muted-foreground">Total Won</span>
            </div>
            {profileQuery.isLoading ? (
              <Skeleton className="h-8 w-28" />
            ) : (
              <p className="text-2xl font-bold text-green-400 font-display">
                {Number(profile?.totalWon ?? 0n).toLocaleString()}
              </p>
            )}
          </CardContent>
        </Card>

        <Card className="casino-card">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-red-900/30 flex items-center justify-center">
                <TrendingDown className="w-5 h-5 text-red-400" />
              </div>
              <span className="text-sm text-muted-foreground">Total Lost</span>
            </div>
            {profileQuery.isLoading ? (
              <Skeleton className="h-8 w-28" />
            ) : (
              <p className="text-2xl font-bold text-red-400 font-display">
                {Number(profile?.totalLost ?? 0n).toLocaleString()}
              </p>
            )}
          </CardContent>
        </Card>

        <Card className="casino-card">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-blue-900/30 flex items-center justify-center">
                <Gamepad2 className="w-5 h-5 text-blue-400" />
              </div>
              <span className="text-sm text-muted-foreground">
                Games Played
              </span>
            </div>
            {profileQuery.isLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <p className="text-2xl font-bold text-blue-400 font-display">
                {Number(profile?.totalGames ?? 0n).toLocaleString()}
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card className="casino-card">
          <CardHeader>
            <CardTitle className="font-display flex items-center gap-2">
              <ArrowDownCircle className="w-5 h-5 text-green-400" />
              Deposit Credits
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="deposit">Amount</Label>
              <Input
                id="deposit"
                type="number"
                data-ocid="dashboard.deposit_input"
                placeholder="Enter amount..."
                value={depositAmount}
                onChange={(e) => setDepositAmount(e.target.value)}
                className="bg-input border-border"
                min="1"
              />
            </div>
            <Button
              data-ocid="dashboard.deposit_button"
              onClick={() => {
                const amt = Number.parseInt(depositAmount);
                if (amt > 0) depositMutation.mutate(BigInt(amt));
              }}
              disabled={
                depositMutation.isPending ||
                !depositAmount ||
                Number.parseInt(depositAmount) <= 0
              }
              className="w-full bg-green-800/50 text-green-300 border border-green-700/50 hover:bg-green-700/50 font-semibold"
            >
              {depositMutation.isPending ? "Depositing..." : "Deposit"}
            </Button>
          </CardContent>
        </Card>

        <Card className="casino-card">
          <CardHeader>
            <CardTitle className="font-display flex items-center gap-2">
              <ArrowUpCircle className="w-5 h-5 text-orange-400" />
              Withdraw Credits
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="withdraw">Amount</Label>
              <Input
                id="withdraw"
                type="number"
                data-ocid="dashboard.withdraw_input"
                placeholder="Enter amount..."
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
                className="bg-input border-border"
                min="1"
              />
            </div>
            <Button
              data-ocid="dashboard.withdraw_button"
              onClick={() => {
                const amt = Number.parseInt(withdrawAmount);
                if (amt > 0) withdrawMutation.mutate(BigInt(amt));
              }}
              disabled={
                withdrawMutation.isPending ||
                !withdrawAmount ||
                Number.parseInt(withdrawAmount) <= 0
              }
              className="w-full bg-orange-900/40 text-orange-300 border border-orange-700/50 hover:bg-orange-800/50 font-semibold"
            >
              {withdrawMutation.isPending ? "Withdrawing..." : "Withdraw"}
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card className="casino-card">
        <CardHeader>
          <CardTitle className="font-display flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" />
            Transaction History
          </CardTitle>
        </CardHeader>
        <CardContent>
          {txQuery.isLoading ? (
            <div className="space-y-3" data-ocid="dashboard.loading_state">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : transactions.length === 0 ? (
            <div
              className="text-center py-12 text-muted-foreground"
              data-ocid="dashboard.empty_state"
            >
              <Calendar className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p>No transactions yet</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table data-ocid="dashboard.table">
                <TableHeader>
                  <TableRow className="border-border hover:bg-transparent">
                    <TableHead className="text-muted-foreground">
                      Type
                    </TableHead>
                    <TableHead className="text-muted-foreground">
                      Amount
                    </TableHead>
                    <TableHead className="text-muted-foreground">
                      Date
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.map((tx) => (
                    <TableRow
                      key={`${String(tx.timestamp)}-${tx.type}`}
                      className="border-border hover:bg-secondary/30"
                    >
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={`capitalize ${
                            tx.type.includes("win") ||
                            tx.type.includes("deposit")
                              ? "border-green-700/50 text-green-400"
                              : "border-red-700/50 text-red-400"
                          }`}
                        >
                          {tx.type}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-semibold text-foreground">
                        {Number(tx.amount).toLocaleString()} Credits
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatDate(tx.timestamp)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
