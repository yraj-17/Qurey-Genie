import React, { useState, useMemo, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  XAxis,
  YAxis
} from 'recharts';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent
} from '@/components/ui/chart';
import {
  Download,
  Copy,
  Check,
  Search,
  Code,
  Eye,
  EyeOff,
  ChevronLeft,
  ChevronRight,
  BarChart3,
  PieChart as PieChartIcon,
  SlidersHorizontal,
  X,
  Database,
  FileText,
  Columns3,
  Filter as Funnel,
  Plus,
  CalendarDays,
  Hash,
  ChevronUp
} from 'lucide-react';

interface EnhancedDataTableProps {
  data: string[][];
  columns: string[];
  sqlQuery?: string;
  executionTime?: number;
  totalRows?: number;
  pageSize?: number;
  searchable?: boolean;
  sortable?: boolean;
  exportable?: boolean;
  showPagination?: boolean;
}

type ChartType = 'bar' | 'line' | 'pie';
type AggregationType = 'count' | 'sum' | 'average' | 'min' | 'max';
type FilterCondition = 'between' | 'equals' | 'contains' | 'gte' | 'lte';

interface ColumnFilter {
  selectedValues: string[];
  dateFrom: string;
  dateTo: string;
  numberFrom: string;
  numberTo: string;
  textValue: string;
  condition: FilterCondition;
}

const DEFAULT_COLORS = ['#2563eb', '#16a34a', '#f97316', '#dc2626', '#7c3aed', '#0891b2'];

const normalizeCell = (value: string | undefined) => (value ?? '').trim();

const parseNumber = (value: string | undefined) => {
  const cleaned = normalizeCell(value).replace(/[$,%\s,]/g, '');
  if (!cleaned) return null;
  const parsed = Number(cleaned);
  return Number.isFinite(parsed) ? parsed : null;
};

const parseDate = (value: string | undefined) => {
  const normalized = normalizeCell(value);
  if (!normalized || /^-?\d+(\.\d+)?$/.test(normalized)) return null;
  if (!/[-/]|[a-zA-Z]{3,}/.test(normalized)) return null;

  const parsed = new Date(normalized);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const isLikelyDateColumn = (rows: string[][], columnIndex: number) => {
  const sample = rows.slice(0, 25).map(row => row[columnIndex]).filter(Boolean);
  if (sample.length === 0) return false;
  const validDates = sample.filter(value => parseDate(value)).length;
  return validDates / sample.length >= 0.65;
};

const isLikelyNumericColumn = (rows: string[][], columnIndex: number) => {
  const sample = rows.slice(0, 25).map(row => row[columnIndex]).filter(Boolean);
  if (sample.length === 0) return false;
  const validNumbers = sample.filter(value => parseNumber(value) !== null).length;
  return validNumbers / sample.length >= 0.65;
};

const EnhancedDataTable: React.FC<EnhancedDataTableProps> = ({
  data,
  columns,
  sqlQuery,
  executionTime,
  totalRows = data.length,
  pageSize = 10,
  searchable = true,
  sortable = false,
  exportable = true,
  showPagination = true
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [copied, setCopied] = useState(false);
  const [sqlVisible, setSqlVisible] = useState(false);
  const [sqlCopied, setSqlCopied] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [activeTab, setActiveTab] = useState('table');
  const [columnFilters, setColumnFilters] = useState<Record<string, ColumnFilter>>({});
  const [filterColumn, setFilterColumn] = useState(columns[0] || '');
  const [chartType, setChartType] = useState<ChartType>('bar');
  const [categoryColumn, setCategoryColumn] = useState(columns[0] || '');
  const [valueColumn, setValueColumn] = useState('__count');
  const [aggregation, setAggregation] = useState<AggregationType>('count');
  const [chartColors, setChartColors] = useState(DEFAULT_COLORS);
  const [filtersVisible, setFiltersVisible] = useState(true);
  const [draftCondition, setDraftCondition] = useState<FilterCondition>('between');
  const [draftValue, setDraftValue] = useState('');
  const [draftValueTo, setDraftValueTo] = useState('');

  const columnProfiles = useMemo(() => {
    return columns.map((column, index) => {
      const values = Array.from(new Set(data.map(row => normalizeCell(row[index]) || 'NULL')))
        .sort((a, b) => a.localeCompare(b))
        .slice(0, 100);
      const numericValues = data
        .map(row => parseNumber(row[index]))
        .filter((value): value is number => value !== null);

      return {
        name: column,
        index,
        values,
        isDate: isLikelyDateColumn(data, index),
        isNumeric: isLikelyNumericColumn(data, index),
        min: numericValues.length ? Math.min(...numericValues) : null,
        max: numericValues.length ? Math.max(...numericValues) : null
      };
    });
  }, [columns, data]);

  const numericColumns = useMemo(
    () => columnProfiles.filter(profile => profile.isNumeric),
    [columnProfiles]
  );

  useEffect(() => {
    setFilterColumn(columns[0] || '');
    setCategoryColumn(columns[0] || '');
    setValueColumn('__count');
    setAggregation('count');
    setColumnFilters({});
    setCurrentPage(1);
  }, [columns, data]);

  useEffect(() => {
    const profile = columnProfiles.find(item => item.name === filterColumn);
    setDraftCondition(profile?.isNumeric || profile?.isDate ? 'between' : 'contains');
    setDraftValue('');
    setDraftValueTo('');
  }, [filterColumn, columnProfiles]);

  // Filter data based on search term
  const filteredData = useMemo(() => {
    return data.filter(row => {
      const matchesSearch = !searchTerm || row.some(cell => 
        cell?.toLowerCase().includes(searchTerm.toLowerCase())
      );

      if (!matchesSearch) return false;

      return Object.entries(columnFilters).every(([columnName, filter]) => {
        const columnIndex = columns.indexOf(columnName);
        if (columnIndex === -1) return true;
        const profile = columnProfiles.find(item => item.name === columnName);

        const cellValue = normalizeCell(row[columnIndex]) || 'NULL';
        if (filter.selectedValues.length > 0 && !filter.selectedValues.includes(cellValue)) {
          return false;
        }

        if (filter.textValue) {
          const normalizedFilter = filter.textValue.toLowerCase();
          const normalizedCell = cellValue.toLowerCase();
          if (filter.condition === 'equals' && normalizedCell !== normalizedFilter) return false;
          if (filter.condition === 'contains' && !normalizedCell.includes(normalizedFilter)) return false;
        }

        if (profile?.isNumeric && (filter.numberFrom || filter.numberTo)) {
          const cellNumber = parseNumber(cellValue);
          if (cellNumber === null) return false;

          if (filter.condition === 'gte' && filter.numberFrom && cellNumber < Number(filter.numberFrom)) return false;
          if (filter.condition === 'lte' && filter.numberFrom && cellNumber > Number(filter.numberFrom)) return false;
          if (filter.condition === 'equals' && filter.numberFrom && cellNumber !== Number(filter.numberFrom)) return false;
          if (filter.condition === 'between') {
            if (filter.numberFrom && cellNumber < Number(filter.numberFrom)) return false;
            if (filter.numberTo && cellNumber > Number(filter.numberTo)) return false;
          }
        }

        if (profile?.isDate && (filter.dateFrom || filter.dateTo)) {
          const cellDate = parseDate(cellValue);
          if (!cellDate) return false;

          if (filter.dateFrom) {
            const fromDate = new Date(filter.dateFrom);
            if (cellDate < fromDate) return false;
          }

          if (filter.dateTo) {
            const toDate = new Date(filter.dateTo);
            toDate.setHours(23, 59, 59, 999);
            if (cellDate > toDate) return false;
          }
        }

        return true;
      });
    });
  }, [data, searchTerm, columnFilters, columns, columnProfiles]);

  const activeFilterCount = useMemo(() => {
    return Object.values(columnFilters).filter(filter =>
      filter.selectedValues.length > 0 || filter.dateFrom || filter.dateTo || filter.numberFrom || filter.numberTo || filter.textValue
    ).length;
  }, [columnFilters]);

  const selectedFilterProfile = columnProfiles.find(profile => profile.name === filterColumn);

  const summaryStats = useMemo(() => {
    const valueIndex = columns.indexOf(valueColumn);
    const numbers = valueIndex >= 0
      ? filteredData.map(row => parseNumber(row[valueIndex])).filter((value): value is number => value !== null)
      : [];

    const sum = numbers.reduce((total, value) => total + value, 0);
    const average = numbers.length ? sum / numbers.length : 0;

    return {
      rowCount: filteredData.length,
      columnCount: columns.length,
      numericColumnCount: numericColumns.length,
      sum,
      average,
      min: numbers.length ? Math.min(...numbers) : 0,
      max: numbers.length ? Math.max(...numbers) : 0
    };
  }, [columns, filteredData, numericColumns.length, valueColumn]);

  const chartData = useMemo(() => {
    const categoryIndex = columns.indexOf(categoryColumn);
    const valueIndex = columns.indexOf(valueColumn);

    if (categoryIndex === -1) return [];

    const grouped = new Map<string, number[]>();
    filteredData.forEach(row => {
      const category = normalizeCell(row[categoryIndex]) || 'NULL';
      const value = valueColumn === '__count' ? 1 : parseNumber(row[valueIndex]);

      if (value === null) return;
      grouped.set(category, [...(grouped.get(category) || []), value]);
    });

    return Array.from(grouped.entries())
      .map(([name, values]) => {
        const sum = values.reduce((total, value) => total + value, 0);
        const aggregateValue =
          aggregation === 'count' ? values.length :
          aggregation === 'average' ? sum / values.length :
          aggregation === 'min' ? Math.min(...values) :
          aggregation === 'max' ? Math.max(...values) :
          sum;

        return {
          name,
          value: Number(aggregateValue.toFixed(2))
        };
      })
      .sort((a, b) => b.value - a.value)
      .slice(0, 12);
  }, [aggregation, categoryColumn, columns, filteredData, valueColumn]);

  // Pagination calculations
  const totalPages = Math.ceil(filteredData.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedData = showPagination 
    ? filteredData.slice(startIndex, endIndex)
    : filteredData;

  // Reset to page 1 when search changes
  useMemo(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  useEffect(() => {
    setCurrentPage(1);
  }, [columnFilters]);

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxPagesToShow = 7;
    
    if (totalPages <= maxPagesToShow) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);
      
      if (currentPage > 3) {
        pages.push('...');
      }
      
      const startPage = Math.max(2, currentPage - 1);
      const endPage = Math.min(totalPages - 1, currentPage + 1);
      
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }
      
      if (currentPage < totalPages - 2) {
        pages.push('...');
      }
      
      pages.push(totalPages);
    }
    
    return pages;
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handlePrevious = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const exportToCSV = () => {
    const csvContent = [
      columns.join(','),
      ...filteredData.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `query_results_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const copyToClipboard = async () => {
    const textContent = [
      columns.join('\t'),
      ...filteredData.map(row => row.join('\t'))
    ].join('\n');
    
    try {
      await navigator.clipboard.writeText(textContent);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const copySqlToClipboard = async () => {
    if (!sqlQuery) return;
    try {
      await navigator.clipboard.writeText(sqlQuery);
      setSqlCopied(true);
      setTimeout(() => setSqlCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const updateFilter = (columnName: string, nextFilter: Partial<ColumnFilter>) => {
    setColumnFilters(prev => ({
      ...prev,
      [columnName]: {
        selectedValues: prev[columnName]?.selectedValues || [],
        dateFrom: prev[columnName]?.dateFrom || '',
        dateTo: prev[columnName]?.dateTo || '',
        numberFrom: prev[columnName]?.numberFrom || '',
        numberTo: prev[columnName]?.numberTo || '',
        textValue: prev[columnName]?.textValue || '',
        condition: prev[columnName]?.condition || 'contains',
        ...nextFilter
      }
    }));
  };

  const toggleFilterValue = (columnName: string, value: string) => {
    const currentValues = columnFilters[columnName]?.selectedValues || [];
    const nextValues = currentValues.includes(value)
      ? currentValues.filter(item => item !== value)
      : [...currentValues, value];

    updateFilter(columnName, { selectedValues: nextValues });
  };

  const clearFilter = (columnName: string) => {
    setColumnFilters(prev => {
      const next = { ...prev };
      delete next[columnName];
      return next;
    });
  };

  const clearAllFilters = () => {
    setSearchTerm('');
    setColumnFilters({});
  };

  const resetDraftFilter = () => {
    setDraftValue('');
    setDraftValueTo('');
  };

  const applyDraftFilter = () => {
    if (!filterColumn) return;

    const profile = columnProfiles.find(item => item.name === filterColumn);
    const baseFilter: ColumnFilter = {
      selectedValues: [],
      dateFrom: '',
      dateTo: '',
      numberFrom: '',
      numberTo: '',
      textValue: '',
      condition: draftCondition
    };

    if (profile?.isNumeric) {
      updateFilter(filterColumn, {
        ...baseFilter,
        numberFrom: draftValue,
        numberTo: draftCondition === 'between' ? draftValueTo : ''
      });
      return;
    }

    if (profile?.isDate) {
      updateFilter(filterColumn, {
        ...baseFilter,
        dateFrom: draftValue,
        dateTo: draftCondition === 'between' ? draftValueTo : ''
      });
      return;
    }

    updateFilter(filterColumn, {
      ...baseFilter,
      textValue: draftValue,
      selectedValues: draftCondition === 'equals' && draftValue ? [draftValue] : []
    });
  };

  const getFilterLabel = (columnName: string, filter: ColumnFilter) => {
    const labelByCondition: Record<FilterCondition, string> = {
      between: 'Between',
      equals: '=',
      contains: 'Contains',
      gte: '>=',
      lte: '<='
    };

    const values = filter.condition === 'between'
      ? [filter.numberFrom || filter.dateFrom, filter.numberTo || filter.dateTo].filter(Boolean).join(' and ')
      : filter.textValue || filter.numberFrom || filter.dateFrom || filter.selectedValues.join(', ');

    return `${columnName} ${labelByCondition[filter.condition]} ${values}`;
  };

  const formatNumber = (value: number) => new Intl.NumberFormat(undefined, {
    maximumFractionDigits: 2
  }).format(value);

  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center py-12 text-gray-500 dark:text-white/50">
        <div className="text-center">
          <div className="text-6xl mb-4">📊</div>
          <p className="text-lg font-medium mb-2">No data to display</p>
          <p className="text-sm">Try running a different query</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* SQL Query Viewer */}
      {sqlQuery && (
        <div className="border border-gray-200 dark:border-white/10 rounded-lg overflow-hidden bg-white dark:bg-[#11091f] shadow-sm dark:shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
          <div className="flex items-center justify-between px-4 py-3 bg-gray-50 dark:bg-white/5 border-b border-gray-200 dark:border-white/10">
            <div className="flex items-center gap-3">
              <Code className="h-4 w-4 text-gray-600 dark:text-brand-300" />
              <span className="text-sm font-medium text-gray-700 dark:text-white/80">SQL Query:</span>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={copySqlToClipboard}
                className="h-8 text-xs hover:bg-gray-100 dark:hover:bg-white/10 dark:text-white/70"
              >
                {sqlCopied ? (
                  <>
                    <Check className="h-3 w-3 mr-1" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="h-3 w-3 mr-1" />
                    Copy
                  </>
                )}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSqlVisible(!sqlVisible)}
                className="h-8 text-xs hover:bg-gray-100 dark:hover:bg-white/10 dark:text-white/70"
              >
                {sqlVisible ? (
                  <>
                    <EyeOff className="h-3 w-3 mr-1" />
                    Hide
                  </>
                ) : (
                  <>
                    <Eye className="h-3 w-3 mr-1" />
                    Show
                  </>
                )}
              </Button>
            </div>
          </div>
          
          {sqlVisible && (
            <div className="px-4 py-3 bg-gray-900 dark:bg-[#070510] text-gray-100 dark:text-white/85 font-mono text-sm overflow-x-auto">
              <pre className="whitespace-pre-wrap">{sqlQuery}</pre>
            </div>
          )}
        </div>
      )}

      {/* Query Results Section */}
      <div className="border border-gray-200 dark:border-white/10 rounded-lg overflow-hidden bg-white dark:bg-[#11091f] shadow-sm dark:shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
        {/* Query Results Header */}
        <div className="flex items-center justify-between px-5 py-5 bg-white dark:bg-[#11091f] border-b border-gray-200 dark:border-white/10">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-md bg-violet-100 text-violet-700 dark:bg-brand-500/15 dark:text-brand-200">
              <Database className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-950 dark:text-white">Query Results</h3>
              <p className="text-sm text-slate-500 dark:text-white/50">Explore and analyze your data</p>
            </div>
          </div>
          <div className="flex h-11 items-center gap-2 rounded-md bg-violet-50 px-4 text-violet-700 dark:bg-brand-500/15 dark:text-brand-100">
            <Database className="h-5 w-5" />
            <span className="text-base font-semibold">{formatNumber(filteredData.length)} rows returned</span>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        {/* Controls Bar */}
        <div className="grid gap-4 px-5 py-4 bg-white dark:bg-[#0a0814] border-b border-gray-100 dark:border-white/10 xl:grid-cols-[auto_minmax(320px,1fr)_auto] xl:items-center">
          <TabsList className="h-11 justify-start rounded-md border border-slate-200 bg-slate-50 p-1 dark:border-white/10 dark:bg-white/5">
            <TabsTrigger value="table" className="h-9 rounded-md px-4 data-[state=active]:bg-white data-[state=active]:text-violet-700 data-[state=active]:shadow-sm dark:data-[state=active]:bg-brand-500/20 dark:data-[state=active]:text-brand-100">
              <SlidersHorizontal className="h-4 w-4 mr-2" />
              Table View
            </TabsTrigger>
            <TabsTrigger value="dashboard" className="h-9 rounded-md px-4 data-[state=active]:bg-white data-[state=active]:text-violet-700 data-[state=active]:shadow-sm dark:data-[state=active]:bg-brand-500/20 dark:data-[state=active]:text-brand-100">
              <BarChart3 className="h-4 w-4 mr-2" />
              Dashboard View
            </TabsTrigger>
          </TabsList>

          {searchable && (
            <div className="relative">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400 dark:text-white/40" />
              <input
                type="text"
                placeholder="Search across all columns... (e.g. 1970, 1039, country)"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-11 w-full rounded-md border border-slate-200 bg-white pl-12 pr-16 text-sm text-slate-900 shadow-sm outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-100 dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-white/40 dark:focus:ring-brand-500/20"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 rounded border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-xs text-slate-500 dark:border-white/10 dark:bg-white/10 dark:text-white/45">
                Ctrl /
              </span>
            </div>
          )}
          
          <div className="flex flex-wrap items-center gap-3 xl:justify-end">
            {exportable && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={copyToClipboard}
                  className="h-11 rounded-md border-slate-200 px-5 text-sm font-medium dark:border-white/10 dark:text-white/70 dark:hover:bg-white/10"
                >
                  <Copy className="h-4 w-4 mr-2" />
                  {copied ? 'Copied' : 'Copy'}
                </Button>
                
                <Button
                  size="sm"
                  onClick={exportToCSV}
                  className="h-11 rounded-md bg-violet-700 px-5 text-sm font-semibold text-white shadow-sm hover:bg-violet-800 dark:bg-brand-600 dark:hover:bg-brand-500"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export CSV
                </Button>
              </>
            )}
          </div>
        </div>

        <div className="border-b border-gray-100 bg-slate-50/60 px-5 py-4 dark:border-white/10 dark:bg-[#0a0814]">
          <div className="rounded-md border border-violet-200 bg-white p-4 shadow-sm dark:border-brand-400/20 dark:bg-[#11091f]">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2 text-violet-700 dark:text-brand-100">
                <Funnel className="h-5 w-5" />
                <span className="font-semibold">Filters</span>
                {activeFilterCount > 0 && (
                  <Badge variant="secondary" className="ml-1 rounded-md bg-violet-50 text-violet-700 dark:bg-brand-500/15 dark:text-brand-100">
                    {activeFilterCount}
                  </Badge>
                )}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setFiltersVisible(!filtersVisible)}
                className="h-8 text-violet-700 hover:bg-violet-50 dark:text-brand-100 dark:hover:bg-white/10"
              >
                {filtersVisible ? 'Hide Filters' : 'Show Filters'}
                <ChevronUp className={`ml-2 h-4 w-4 transition-transform ${filtersVisible ? '' : 'rotate-180'}`} />
              </Button>
            </div>

            {filtersVisible && (
              <>
                <div className="grid gap-4 xl:grid-cols-[minmax(160px,1.2fr)_minmax(150px,0.9fr)_minmax(140px,0.9fr)_minmax(140px,0.9fr)_auto_auto_auto] xl:items-end">
                  <div className="space-y-2">
                    <Label className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-white/45">Column</Label>
                    <Select value={filterColumn} onValueChange={setFilterColumn}>
                      <SelectTrigger className="h-11 rounded-md bg-white text-sm dark:bg-white/5 dark:border-white/10 dark:text-white">
                        <SelectValue placeholder="Choose column" />
                      </SelectTrigger>
                      <SelectContent>
                        {columns.map(column => (
                          <SelectItem key={column} value={column}>{column}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-white/45">Condition</Label>
                    <Select value={draftCondition} onValueChange={(value) => setDraftCondition(value as FilterCondition)}>
                      <SelectTrigger className="h-11 rounded-md bg-white text-sm dark:bg-white/5 dark:border-white/10 dark:text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="between" disabled={!selectedFilterProfile?.isNumeric && !selectedFilterProfile?.isDate}>Between</SelectItem>
                        <SelectItem value="equals">Equals</SelectItem>
                        <SelectItem value="contains" disabled={selectedFilterProfile?.isNumeric || selectedFilterProfile?.isDate}>Contains</SelectItem>
                        <SelectItem value="gte" disabled={!selectedFilterProfile?.isNumeric}>Greater than or equal</SelectItem>
                        <SelectItem value="lte" disabled={!selectedFilterProfile?.isNumeric}>Less than or equal</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-white/45">
                      {draftCondition === 'between' ? 'Min Value' : 'Value'}
                    </Label>
                    <Input
                      type={selectedFilterProfile?.isDate ? 'date' : selectedFilterProfile?.isNumeric ? 'number' : 'text'}
                      placeholder={selectedFilterProfile?.isNumeric && selectedFilterProfile.min !== null ? String(selectedFilterProfile.min) : 'Enter value'}
                      value={draftValue}
                      onChange={(event) => setDraftValue(event.target.value)}
                      className="h-11 rounded-md bg-white text-sm dark:bg-white/5 dark:border-white/10 dark:text-white"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-white/45">Max Value</Label>
                    <Input
                      type={selectedFilterProfile?.isDate ? 'date' : selectedFilterProfile?.isNumeric ? 'number' : 'text'}
                      placeholder={selectedFilterProfile?.isNumeric && selectedFilterProfile.max !== null ? String(selectedFilterProfile.max) : 'Optional'}
                      value={draftValueTo}
                      onChange={(event) => setDraftValueTo(event.target.value)}
                      disabled={draftCondition !== 'between'}
                      className="h-11 rounded-md bg-white text-sm disabled:bg-slate-50 disabled:text-slate-400 dark:bg-white/5 dark:border-white/10 dark:text-white dark:disabled:bg-white/5"
                    />
                  </div>

                  <Button
                    variant="outline"
                    onClick={applyDraftFilter}
                    className="h-11 rounded-md border-violet-200 px-5 text-violet-700 hover:bg-violet-50 dark:border-brand-400/25 dark:text-brand-100 dark:hover:bg-white/10"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Filter
                  </Button>
                  <Button
                    onClick={applyDraftFilter}
                    className="h-11 rounded-md bg-violet-700 px-5 font-semibold text-white hover:bg-violet-800 dark:bg-brand-600 dark:hover:bg-brand-500"
                  >
                    <Funnel className="h-4 w-4 mr-2" />
                    Apply Filters
                  </Button>
                  <Button
                    variant="outline"
                    onClick={clearAllFilters}
                    className="h-11 rounded-md border-slate-200 px-5 dark:border-white/10 dark:text-white/70 dark:hover:bg-white/10"
                  >
                    Reset
                  </Button>
                </div>

                <div className="mt-4 border-t border-slate-200 pt-4 dark:border-white/10">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-semibold text-violet-700 dark:text-brand-100">Active Filters:</span>
                    {activeFilterCount === 0 ? (
                      <span className="text-sm text-slate-500 dark:text-white/45">None</span>
                    ) : (
                      Object.entries(columnFilters)
                        .filter(([, filter]) => filter.selectedValues.length > 0 || filter.dateFrom || filter.dateTo || filter.numberFrom || filter.numberTo || filter.textValue)
                        .map(([columnName, filter]) => (
                          <button
                            key={columnName}
                            type="button"
                            onClick={() => clearFilter(columnName)}
                            className="inline-flex h-8 items-center gap-2 rounded-md bg-violet-50 px-3 text-sm font-medium text-violet-700 hover:bg-violet-100 dark:bg-brand-500/15 dark:text-brand-100 dark:hover:bg-brand-500/25"
                          >
                            {getFilterLabel(columnName, filter)}
                            <X className="h-4 w-4" />
                          </button>
                        ))
                    )}
                    {activeFilterCount > 0 && (
                      <Button variant="ghost" size="sm" onClick={clearAllFilters} className="h-8 text-violet-700 hover:bg-violet-50 dark:text-brand-100 dark:hover:bg-white/10">
                        Clear All
                      </Button>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>

          <div className="mt-4 grid gap-4 md:grid-cols-4">
            {[
              { label: 'Total Rows', value: formatNumber(totalRows), icon: Database, tone: 'violet' },
              { label: 'Filtered Rows', value: formatNumber(filteredData.length), icon: Funnel, tone: 'green' },
              { label: 'Columns', value: formatNumber(columns.length), icon: Columns3, tone: 'blue' },
              { label: 'Showing', value: filteredData.length ? `${formatNumber(startIndex + 1)} - ${formatNumber(Math.min(endIndex, filteredData.length))}` : '0', icon: FileText, tone: 'amber' }
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between rounded-md border border-slate-200 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-[#11091f]">
                <div className="flex items-center gap-3">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-md ${
                    item.tone === 'green' ? 'bg-green-50 text-green-600 dark:bg-green-500/15 dark:text-green-200' :
                    item.tone === 'blue' ? 'bg-blue-50 text-blue-600 dark:bg-blue-500/15 dark:text-blue-200' :
                    item.tone === 'amber' ? 'bg-amber-50 text-amber-600 dark:bg-amber-500/15 dark:text-amber-200' :
                    'bg-violet-50 text-violet-700 dark:bg-brand-500/15 dark:text-brand-100'
                  }`}>
                    <item.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-500 dark:text-white/45">{item.label}</p>
                    <p className="text-2xl font-semibold text-slate-950 dark:text-white">{item.value}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <TabsContent value="table" className="m-0">
        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-white dark:bg-[#0a0814] border-b border-gray-200 dark:border-white/10">
                {columns.map((column, index) => (
                  <th
                    key={index}
                    className="border-r border-slate-100 px-4 py-3 text-left text-sm font-semibold text-gray-800 last:border-r-0 dark:border-white/5 dark:text-white/80"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className="flex items-center gap-2">
                        {columnProfiles[index]?.isDate ? (
                          <CalendarDays className="h-4 w-4 text-slate-500 dark:text-white/45" />
                        ) : columnProfiles[index]?.isNumeric ? (
                          <Hash className="h-4 w-4 text-slate-500 dark:text-white/45" />
                        ) : (
                          <span className="text-xs font-bold text-slate-500 dark:text-white/45">Aa</span>
                        )}
                        {column}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setFilterColumn(column);
                          setFiltersVisible(true);
                        }}
                        className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-violet-700 dark:hover:bg-white/10 dark:hover:text-brand-100"
                        aria-label={`Filter ${column}`}
                      >
                        <Funnel className="h-4 w-4" />
                      </button>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-[#11091f]">
              {paginatedData.map((row, rowIndex) => (
                <tr
                  key={rowIndex}
                  className="border-b border-gray-100 dark:border-white/5 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                >
                  {row.map((cell, cellIndex) => (
                    <td
                      key={cellIndex}
                      className="px-6 py-3.5 text-sm text-gray-900 dark:text-white/80"
                    >
                      {cell || (
                        <span className="text-gray-400 dark:text-white/35 italic text-xs">NULL</span>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {showPagination && totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-4 bg-white dark:bg-[#0a0814] border-t border-gray-200 dark:border-white/10">
            <div className="text-sm text-gray-600 dark:text-white/60">
              Showing {startIndex + 1} to {Math.min(endIndex, filteredData.length)} of {filteredData.length} results
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrevious}
                disabled={currentPage === 1}
                className="h-9 px-3 border-gray-300 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium dark:text-white/70"
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Previous
              </Button>
              
              <div className="flex items-center gap-1">
                {getPageNumbers().map((page, index) => (
                  <React.Fragment key={index}>
                    {page === '...' ? (
                      <span className="px-2 text-gray-500 dark:text-white/45 text-sm">...</span>
                    ) : (
                      <Button
                        variant={currentPage === page ? "default" : "outline"}
                        size="sm"
                        onClick={() => handlePageChange(page as number)}
                        className={`h-9 min-w-[36px] px-3 text-sm font-medium ${
                          currentPage === page
                            ? "bg-gray-900 dark:bg-brand-600 text-white hover:bg-gray-800 dark:hover:bg-brand-500 border-gray-900 dark:border-brand-500"
                            : "border-gray-300 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/10 text-gray-700 dark:text-white/70"
                        }`}
                      >
                        {page}
                      </Button>
                    )}
                  </React.Fragment>
                ))}
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={handleNext}
                disabled={currentPage === totalPages}
                className="h-9 px-3 border-gray-300 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium dark:text-white/70"
              >
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        )}
        </TabsContent>

        <TabsContent value="dashboard" className="m-0">
          <div className="p-4">
            <div className="grid gap-4 lg:grid-cols-[280px_minmax(0,1fr)]">
              <div className="space-y-4 rounded-md border border-gray-200 p-4 dark:border-white/10">
                <div className="space-y-2">
                  <Label>Chart type</Label>
                  <Select value={chartType} onValueChange={(value) => setChartType(value as ChartType)}>
                    <SelectTrigger className="dark:bg-white/5 dark:border-white/10 dark:text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bar">Bar</SelectItem>
                      <SelectItem value="line">Line</SelectItem>
                      <SelectItem value="pie">Pie</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Group by</Label>
                  <Select value={categoryColumn} onValueChange={setCategoryColumn}>
                    <SelectTrigger className="dark:bg-white/5 dark:border-white/10 dark:text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {columns.map(column => (
                        <SelectItem key={column} value={column}>{column}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Value</Label>
                  <Select
                    value={valueColumn}
                    onValueChange={(value) => {
                      setValueColumn(value);
                      setAggregation(value === '__count' ? 'count' : 'sum');
                    }}
                  >
                    <SelectTrigger className="dark:bg-white/5 dark:border-white/10 dark:text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__count">Count rows</SelectItem>
                      {numericColumns.map(column => (
                        <SelectItem key={column.name} value={column.name}>{column.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Aggregation</Label>
                  <Select value={aggregation} onValueChange={(value) => setAggregation(value as AggregationType)}>
                    <SelectTrigger className="dark:bg-white/5 dark:border-white/10 dark:text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="count">Count</SelectItem>
                      <SelectItem value="sum" disabled={valueColumn === '__count'}>Sum</SelectItem>
                      <SelectItem value="average" disabled={valueColumn === '__count'}>Average</SelectItem>
                      <SelectItem value="min" disabled={valueColumn === '__count'}>Minimum</SelectItem>
                      <SelectItem value="max" disabled={valueColumn === '__count'}>Maximum</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Colors</Label>
                  <div className="grid grid-cols-6 gap-2">
                    {chartColors.map((color, index) => (
                      <Input
                        key={index}
                        type="color"
                        value={color}
                        onChange={(event) => {
                          const nextColors = [...chartColors];
                          nextColors[index] = event.target.value;
                          setChartColors(nextColors);
                        }}
                        className="h-9 w-full p-1 dark:bg-white/5 dark:border-white/10"
                        aria-label={`Chart color ${index + 1}`}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div className="rounded-md border border-gray-200 p-4 dark:border-white/10">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">Visualization</p>
                    <p className="text-sm text-gray-500 dark:text-white/50">
                      {aggregation} by {categoryColumn}
                    </p>
                  </div>
                  {chartType === 'pie' ? <PieChartIcon className="h-5 w-5 text-gray-500" /> : <BarChart3 className="h-5 w-5 text-gray-500" />}
                </div>

                {chartData.length > 0 ? (
                  <ChartContainer
                    config={{ value: { label: aggregation, color: chartColors[0] } }}
                    className="h-[360px] w-full"
                  >
                    {chartType === 'pie' ? (
                      <PieChart>
                        <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                        <Pie data={chartData} dataKey="value" nameKey="name" outerRadius={120} label>
                          {chartData.map((_, index) => (
                            <Cell key={index} fill={chartColors[index % chartColors.length]} />
                          ))}
                        </Pie>
                      </PieChart>
                    ) : chartType === 'line' ? (
                      <LineChart data={chartData}>
                        <CartesianGrid vertical={false} />
                        <XAxis dataKey="name" tickLine={false} axisLine={false} interval={0} angle={-20} textAnchor="end" height={70} />
                        <YAxis tickLine={false} axisLine={false} />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Line type="monotone" dataKey="value" stroke={chartColors[0]} strokeWidth={2.5} dot={{ fill: chartColors[0] }} />
                      </LineChart>
                    ) : (
                      <BarChart data={chartData}>
                        <CartesianGrid vertical={false} />
                        <XAxis dataKey="name" tickLine={false} axisLine={false} interval={0} angle={-20} textAnchor="end" height={70} />
                        <YAxis tickLine={false} axisLine={false} />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                          {chartData.map((_, index) => (
                            <Cell key={index} fill={chartColors[index % chartColors.length]} />
                          ))}
                        </Bar>
                      </BarChart>
                    )}
                  </ChartContainer>
                ) : (
                  <div className="flex h-[360px] items-center justify-center rounded-md border border-dashed border-gray-300 text-sm text-gray-500 dark:border-white/10 dark:text-white/45">
                    No chartable data for the current filter.
                  </div>
                )}
              </div>
            </div>
          </div>
        </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default EnhancedDataTable;
