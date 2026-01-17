// @ts-nocheck
import React, { useState, useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '../../utils';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { 
  Search, Car, Users, Landmark, Building2, Shield, 
  CreditCard, FileText, FolderKanban, User 
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function GlobalSearch() {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const { data: vehicles = [] } = useQuery({
    queryKey: ['vehicles'],
    queryFn: () => base44.entities.Vehicle.list(),
    staleTime: 60000
  });

  const { data: drivers = [] } = useQuery({
    queryKey: ['drivers'],
    queryFn: () => base44.entities.Driver.list(),
    staleTime: 60000
  });

  const { data: banks = [] } = useQuery({
    queryKey: ['banks'],
    queryFn: () => base44.entities.Bank.list(),
    staleTime: 60000
  });

  const { data: gies = [] } = useQuery({
    queryKey: ['gies'],
    queryFn: () => base44.entities.GIE.list(),
    staleTime: 60000
  });

  const { data: funds = [] } = useQuery({
    queryKey: ['guarantee-funds'],
    queryFn: () => base44.entities.GuaranteeFund.list(),
    staleTime: 60000
  });

  const { data: programs = [] } = useQuery({
    queryKey: ['programs'],
    queryFn: () => base44.entities.FinancingProgram.list(),
    staleTime: 60000
  });

  const { data: guarantees = [] } = useQuery({
    queryKey: ['guarantees'],
    queryFn: () => base44.entities.Guarantee.list(),
    staleTime: 60000
  });

  const { data: payments = [] } = useQuery({
    queryKey: ['payments-search'],
    queryFn: () => base44.entities.DailyPayment.list('-payment_date', 200),
    staleTime: 60000
  });

  useEffect(() => {
    const down = (e) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  const searchResults = useMemo(() => {
    if (!searchQuery || searchQuery.length < 2) return null;

    const query = searchQuery.toLowerCase();
    const results = {
      vehicles: [],
      drivers: [],
      banks: [],
      gies: [],
      funds: [],
      programs: [],
      guarantees: [],
      payments: []
    };

    // Search vehicles
    results.vehicles = vehicles.filter(v => 
      v.registration_number?.toLowerCase().includes(query) ||
      v.brand?.toLowerCase().includes(query) ||
      v.model?.toLowerCase().includes(query) ||
      v.vin?.toLowerCase().includes(query)
    ).slice(0, 5);

    // Search drivers
    results.drivers = drivers.filter(d =>
      d.first_name?.toLowerCase().includes(query) ||
      d.last_name?.toLowerCase().includes(query) ||
      d.phone?.includes(query) ||
      d.id_number?.toLowerCase().includes(query)
    ).slice(0, 5);

    // Search banks
    results.banks = banks.filter(b =>
      b.name?.toLowerCase().includes(query) ||
      b.code?.toLowerCase().includes(query)
    ).slice(0, 5);

    // Search GIEs
    results.gies = gies.filter(g =>
      g.name?.toLowerCase().includes(query) ||
      g.registration_number?.includes(query) ||
      g.president_name?.toLowerCase().includes(query)
    ).slice(0, 5);

    // Search funds
    results.funds = funds.filter(f =>
      f.name?.toLowerCase().includes(query) ||
      f.code?.toLowerCase().includes(query)
    ).slice(0, 5);

    // Search programs
    results.programs = programs.filter(p =>
      p.name?.toLowerCase().includes(query) ||
      p.code?.toLowerCase().includes(query)
    ).slice(0, 5);

    // Search guarantees by vehicle registration
    const matchingVehicles = vehicles.filter(v => 
      v.registration_number?.toLowerCase().includes(query)
    );
    if (matchingVehicles.length > 0) {
      const vehicleIds = matchingVehicles.map(v => v.id);
      results.guarantees = guarantees.filter(g => 
        vehicleIds.includes(g.vehicle_id)
      ).slice(0, 5);
    }

    // Search payments by transaction ID or reference
    results.payments = payments.filter(p =>
      p.transaction_id?.toLowerCase().includes(query) ||
      p.routing_reference?.toLowerCase().includes(query)
    ).slice(0, 5);

    return results;
  }, [searchQuery, vehicles, drivers, banks, gies, funds, programs, guarantees, payments]);

  const handleSelect = (type, item) => {
    setOpen(false);
    setSearchQuery('');

    switch(type) {
      case 'vehicle':
        navigate(createPageUrl('Vehicles'));
        break;
      case 'driver':
        navigate(`${createPageUrl('DriverPaymentHistory')}?driver=${item.id}`);
        break;
      case 'bank':
        navigate(createPageUrl('Banks'));
        break;
      case 'gie':
        navigate(createPageUrl('GIEs'));
        break;
      case 'fund':
        navigate(createPageUrl('GuaranteeFunds'));
        break;
      case 'program':
        navigate(createPageUrl('Programs'));
        break;
      case 'guarantee':
        navigate(`${createPageUrl('VehicleGuaranteeHistory')}?vehicle=${item.vehicle_id}`);
        break;
      case 'payment':
        navigate(createPageUrl('Payments'));
        break;
    }
  };

  const getVehicle = (id) => vehicles.find(v => v.id === id);

  const totalResults = searchResults ? 
    Object.values(searchResults).reduce((sum, arr) => sum + arr.length, 0) : 0;

  return (
    <>
      <Button 
        variant="outline" 
        onClick={() => setOpen(true)}
        className="relative w-full sm:w-64 justify-start text-sm text-slate-500 bg-slate-50 hover:bg-slate-100"
      >
        <Search className="w-4 h-4 mr-2" />
        Recherche globale...
        <kbd className="pointer-events-none absolute right-2 hidden h-5 select-none items-center gap-1 rounded border bg-slate-100 px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
          <span className="text-xs">⌘</span>K
        </kbd>
      </Button>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput 
          placeholder="Rechercher véhicules, chauffeurs, banques..." 
          value={searchQuery}
          onValueChange={setSearchQuery}
        />
        <CommandList>
          {!searchQuery || searchQuery.length < 2 ? (
            <CommandEmpty>Tapez au moins 2 caractères pour rechercher</CommandEmpty>
          ) : totalResults === 0 ? (
            <CommandEmpty>Aucun résultat trouvé</CommandEmpty>
          ) : (
            <>
              {/* Vehicles */}
              {searchResults.vehicles.length > 0 && (
                <CommandGroup heading="Véhicules">
                  {searchResults.vehicles.map((v) => (
                    <CommandItem
                      key={v.id}
                      onSelect={() => handleSelect('vehicle', v)}
                      className="cursor-pointer"
                    >
                      <Car className="w-4 h-4 mr-2 text-amber-500" />
                      <div className="flex-1">
                        <p className="font-medium">{v.registration_number}</p>
                        <p className="text-xs text-slate-500">{v.brand} {v.model}</p>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {v.status}
                      </Badge>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}

              {/* Drivers */}
              {searchResults.drivers.length > 0 && (
                <>
                  <CommandSeparator />
                  <CommandGroup heading="Chauffeurs">
                    {searchResults.drivers.map((d) => (
                      <CommandItem
                        key={d.id}
                        onSelect={() => handleSelect('driver', d)}
                        className="cursor-pointer"
                      >
                        <User className="w-4 h-4 mr-2 text-blue-500" />
                        <div className="flex-1">
                          <p className="font-medium">{d.first_name} {d.last_name}</p>
                          <p className="text-xs text-slate-500">{d.phone}</p>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {d.status}
                        </Badge>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </>
              )}

              {/* Banks */}
              {searchResults.banks.length > 0 && (
                <>
                  <CommandSeparator />
                  <CommandGroup heading="Banques">
                    {searchResults.banks.map((b) => (
                      <CommandItem
                        key={b.id}
                        onSelect={() => handleSelect('bank', b)}
                        className="cursor-pointer"
                      >
                        <Landmark className="w-4 h-4 mr-2 text-indigo-500" />
                        <div className="flex-1">
                          <p className="font-medium">{b.name}</p>
                          <p className="text-xs text-slate-500">Code: {b.code}</p>
                        </div>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </>
              )}

              {/* GIEs */}
              {searchResults.gies.length > 0 && (
                <>
                  <CommandSeparator />
                  <CommandGroup heading="GIE">
                    {searchResults.gies.map((g) => (
                      <CommandItem
                        key={g.id}
                        onSelect={() => handleSelect('gie', g)}
                        className="cursor-pointer"
                      >
                        <Building2 className="w-4 h-4 mr-2 text-purple-500" />
                        <div className="flex-1">
                          <p className="font-medium">{g.name}</p>
                          <p className="text-xs text-slate-500">{g.members_count || 0} membres</p>
                        </div>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </>
              )}

              {/* Programs */}
              {searchResults.programs.length > 0 && (
                <>
                  <CommandSeparator />
                  <CommandGroup heading="Programmes">
                    {searchResults.programs.map((p) => (
                      <CommandItem
                        key={p.id}
                        onSelect={() => handleSelect('program', p)}
                        className="cursor-pointer"
                      >
                        <FolderKanban className="w-4 h-4 mr-2 text-teal-500" />
                        <div className="flex-1">
                          <p className="font-medium">{p.name}</p>
                          <p className="text-xs text-slate-500">Code: {p.code}</p>
                        </div>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </>
              )}

              {/* Funds */}
              {searchResults.funds.length > 0 && (
                <>
                  <CommandSeparator />
                  <CommandGroup heading="Fonds de garantie">
                    {searchResults.funds.map((f) => (
                      <CommandItem
                        key={f.id}
                        onSelect={() => handleSelect('fund', f)}
                        className="cursor-pointer"
                      >
                        <Shield className="w-4 h-4 mr-2 text-green-500" />
                        <div className="flex-1">
                          <p className="font-medium">{f.name}</p>
                          <p className="text-xs text-slate-500">Couverture: {f.coverage_rate}%</p>
                        </div>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </>
              )}

              {/* Guarantees */}
              {searchResults.guarantees.length > 0 && (
                <>
                  <CommandSeparator />
                  <CommandGroup heading="Garanties">
                    {searchResults.guarantees.map((g) => {
                      const vehicle = getVehicle(g.vehicle_id);
                      return (
                        <CommandItem
                          key={g.id}
                          onSelect={() => handleSelect('guarantee', g)}
                          className="cursor-pointer"
                        >
                          <FileText className="w-4 h-4 mr-2 text-orange-500" />
                          <div className="flex-1">
                            <p className="font-medium">Garantie {vehicle?.registration_number}</p>
                            <p className="text-xs text-slate-500">
                              {g.guarantee_amount?.toLocaleString('fr-FR')} F
                            </p>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {g.status}
                          </Badge>
                        </CommandItem>
                      );
                    })}
                  </CommandGroup>
                </>
              )}

              {/* Payments */}
              {searchResults.payments.length > 0 && (
                <>
                  <CommandSeparator />
                  <CommandGroup heading="Paiements">
                    {searchResults.payments.map((p) => {
                      const vehicle = getVehicle(p.vehicle_id);
                      return (
                        <CommandItem
                          key={p.id}
                          onSelect={() => handleSelect('payment', p)}
                          className="cursor-pointer"
                        >
                          <CreditCard className="w-4 h-4 mr-2 text-emerald-500" />
                          <div className="flex-1">
                            <p className="font-medium">
                              {vehicle?.registration_number || 'Véhicule'} - {p.paid_amount?.toLocaleString('fr-FR')} F
                            </p>
                            <p className="text-xs text-slate-500">
                              {p.transaction_id || p.payment_date}
                            </p>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {p.status}
                          </Badge>
                        </CommandItem>
                      );
                    })}
                  </CommandGroup>
                </>
              )}
            </>
          )}
        </CommandList>
      </CommandDialog>
    </>
  );
}