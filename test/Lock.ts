import { expect } from "chai";
import { ContractFactory, Contract, Signer, utils, BigNumber } from "ethers";
import { ethers, waffle } from "hardhat";

describe("Lock Contract", function () {
  let Lock: ContractFactory;
  let lock: Contract;
  let owner: Signer;
  let otherAccount: Signer;

  const ONE_GWEI = utils.parseUnits("1", "gwei");

  beforeEach(async () => {
    [owner, otherAccount] = await ethers.getSigners();
    Lock = await ethers.getContractFactory("Lock");
    lock = await Lock.deploy((await ethers.provider.getBlock("latest")).timestamp + 3600, { value: ONE_GWEI });
  });

  describe("Deployment", function () {
    it("Should set the correct initial unlock time and owner", async function () {
      // Obtenemos el tiempo actual del bloque más reciente y le sumamos 1 hora (3600 segundos)
      const currentTime = BigNumber.from((await ethers.provider.getBlock("latest")).timestamp).add(3600);

      // Obtenemos el tiempo de desbloqueo del contrato
      const unlockTime = await lock.unlockTime();

      // Comprobamos que el tiempo de desbloqueo esté cerca del tiempo actual más 1 hora,
      // con un margen de 2 segundos (debido a posibles variaciones en la red)
      expect(unlockTime).to.be.closeTo(currentTime, 2);

      // Comprobamos que el propietario del contrato sea la dirección del propietario esperado
      expect(await lock.owner()).to.equal(await owner.getAddress());
    });

    it("Should receive and store the correct funds to lock", async function () {
      expect(await ethers.provider.getBalance(lock.address)).to.equal(ONE_GWEI);
    });
  });

  describe("Lock Extension", function () {
    it("Should allow the owner to extend the lock by 2 hours (7200 seconds) time", async function () {
      const newUnlockTime = (await ethers.provider.getBlock("latest")).timestamp + 7200;
      await lock.connect(owner).extendLock(newUnlockTime);
      expect(await lock.unlockTime()).to.equal(newUnlockTime);
    });

    it("Should not allow non-owner to extend the lock by 2 hours (7200 seconds) time", async function () {
      const newUnlockTime = (await ethers.provider.getBlock("latest")).timestamp + 7200;
      await expect(lock.connect(otherAccount).extendLock(newUnlockTime)).to.be.revertedWith("You aren't the owner");
    });
  });

  describe("Withdrawals", function () {
    it("Should revert if called before the unlock time", async function () {
      await expect(lock.withdraw()).to.be.revertedWith("You can't withdraw yet");
    });

    it("Should allow the owner to withdraw after the unlock time", async function () {
      const newUnlockTime = (await ethers.provider.getBlock("latest")).timestamp + 3600;
      await lock.connect(owner).extendLock(newUnlockTime);

      await ethers.provider.send("evm_setNextBlockTimestamp", [newUnlockTime + 1]);
      await ethers.provider.send("evm_mine", []);

      const ownerBalanceBefore: BigNumber = await ethers.provider.getBalance(await owner.getAddress());
      await lock.connect(owner).withdraw();
      const ownerBalanceAfter: BigNumber = await ethers.provider.getBalance(await owner.getAddress());

      // Permitir una diferencia de hasta 1 gwei debido a las tarifas de gas
      const allowedDifference = utils.parseUnits("1", "gwei");

      // Calcular la diferencia real entre el balance antes y después del retiro
      const actualDifference = ownerBalanceAfter.sub(ownerBalanceBefore);

      // Verificar que la diferencia actual sea menor o igual a la diferencia permitida
      const isWithinAllowedDifference = actualDifference.lte(allowedDifference);

      expect(isWithinAllowedDifference, "Actual difference is within allowed difference").to.be.true;
    });

    it("Should emit Withdrawal event on successful withdrawal", async function () {
      const newUnlockTime = (await ethers.provider.getBlock("latest")).timestamp + 3600;

      await lock.connect(owner).extendLock(newUnlockTime);

      await ethers.provider.send("evm_setNextBlockTimestamp", [newUnlockTime + 1]);
      await ethers.provider.send("evm_mine", []);

      const tx = await lock.connect(owner).withdraw();
      const receipt = await tx.wait();

      // Obtiene el evento Withdrawal del registro de eventos
      const withdrawalEvent = receipt.events.find((event: any) => event.event === "Withdrawal");

      // Verifica que el evento se emitió correctamente
      expect(withdrawalEvent).to.not.be.undefined;
      expect(withdrawalEvent.args.amount).to.equal(ONE_GWEI);

      // Convierte el valor BigNumber a un número antes de verificar
      const whenValue = withdrawalEvent.args.when.toNumber();
      expect(whenValue).to.be.closeTo(newUnlockTime + 1, 2);
    });
  });
});
